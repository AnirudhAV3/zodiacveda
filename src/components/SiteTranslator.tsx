"use client";

import { useEffect, useState } from "react";
import { LANGUAGES, LANG_KEY } from "@/lib/languages";

type TranslationRecord = {
  original: string;
  lastApplied: string;
  apply: (value: string) => void;
};

const ATTRIBUTE_NAMES = ["aria-label", "placeholder", "title", "alt"] as const;
const IGNORED_ANCESTORS = "script,style,noscript,textarea,pre,code,svg,[data-no-translate]";
const MAX_CACHED_TRANSLATIONS = 5_000;
const translations = new Map<string, string>();
const textRecords = new WeakMap<Text, TranslationRecord>();
const attributeRecords = new WeakMap<Element, Map<string, TranslationRecord>>();

function decodeTranslation(value: string) {
  const decoder = document.createElement("textarea");
  decoder.innerHTML = value;
  return decoder.value;
}

function sendStatus(detail: { language: string; status: "translating" | "ready" | "error"; message?: string }) {
  window.dispatchEvent(new CustomEvent("zv-translation-status", { detail }));
}

export default function SiteTranslator() {
  const [target, setTarget] = useState("en");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let storedLanguage = "en";
    try {
      storedLanguage = localStorage.getItem(LANG_KEY) ?? "en";
    } catch {
      storedLanguage = "en";
    }
    const language = LANGUAGES.some((entry) => entry.code === storedLanguage) ? storedLanguage : "en";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Restore the selected language after client hydration.
    setTarget(language);
    document.documentElement.lang = language;
  }, []);

  useEffect(() => {
    const onLanguageChange = (event: Event) => {
      if (event instanceof CustomEvent && typeof event.detail === "string") {
        setTarget(LANGUAGES.some((language) => language.code === event.detail) ? event.detail : "en");
      }
    };
    const onTranslationRetry = () => setRetry((value) => value + 1);
    window.addEventListener("zv-lang", onLanguageChange);
    window.addEventListener("zv-translation-retry", onTranslationRetry);
    return () => {
      window.removeEventListener("zv-lang", onLanguageChange);
      window.removeEventListener("zv-translation-retry", onTranslationRetry);
    };
  }, [target]);

  useEffect(() => {
    const controller = new AbortController();
    const queued = new Map<string, TranslationRecord>();
    const failed = new Set<string>();
    let inFlightKeys: string[] = [];
    let draining = false;
    let scheduled = false;
    let providerFailed = false;

    const keyFor = (source: string) => `${target}\u0000${source}`;
    const enqueue = (record: TranslationRecord) => {
      if (!record.original.trim()) return;
      if (target === "en") {
        if (record.lastApplied !== record.original) {
          record.apply(record.original);
          record.lastApplied = record.original;
        }
        return;
      }

      const key = keyFor(record.original);
      const cached = translations.get(key);
      if (cached !== undefined) {
        if (record.lastApplied !== cached) {
          record.apply(cached);
          record.lastApplied = cached;
        }
      } else if (!providerFailed && !failed.has(key)) {
        queued.set(key, record);
        scheduleDrain();
      }
    };

    const recordText = (node: Text) => {
      const parent = node.parentElement;
      if (!parent || parent.closest(IGNORED_ANCESTORS)) return;
      const value = node.nodeValue ?? "";
      let record = textRecords.get(node);
      if (!record) {
        record = {
          original: value,
          lastApplied: value,
          apply: (next) => { node.nodeValue = next; },
        };
        textRecords.set(node, record);
      } else if (value !== record.lastApplied) {
        record.original = value;
        record.lastApplied = value;
      }
      enqueue(record);
    };

    const recordAttribute = (element: Element, name: string) => {
      const value = element.getAttribute(name);
      if (!value?.trim()) return;
      let records = attributeRecords.get(element);
      if (!records) {
        records = new Map();
        attributeRecords.set(element, records);
      }
      let record = records.get(name);
      if (!record) {
        record = {
          original: value,
          lastApplied: value,
          apply: (next) => element.setAttribute(name, next),
        };
        records.set(name, record);
      } else if (value !== record.lastApplied) {
        record.original = value;
        record.lastApplied = value;
      }
      enqueue(record);
    };

    const scan = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) {
        recordText(root as Text);
        return;
      }
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        recordText(node as Text);
        node = walker.nextNode();
      }
      if (root instanceof Element) {
        recordElementAttributes(root);
        root.querySelectorAll("*").forEach(recordElementAttributes);
      }
    };

    function recordElementAttributes(element: Element) {
      if (element.closest(IGNORED_ANCESTORS)) return;
      for (const name of ATTRIBUTE_NAMES) recordAttribute(element, name);
    }

    function scheduleDrain() {
      if (scheduled || draining) return;
      scheduled = true;
      window.setTimeout(() => {
        scheduled = false;
        void drain();
      }, 60);
    }

    async function drain() {
      if (draining || controller.signal.aborted) return;
      draining = true;
      try {
        while (queued.size && !controller.signal.aborted) {
          const batch = [...queued.entries()].slice(0, 50);
          batch.forEach(([key]) => queued.delete(key));
          inFlightKeys = batch.map(([key]) => key);
          sendStatus({ language: target, status: "translating" });
          const response = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ target, texts: batch.map(([, record]) => record.original) }),
            signal: controller.signal,
          });
          const result = await response.json() as { translations?: unknown; error?: string };
          if (!response.ok || !Array.isArray(result.translations) || result.translations.length !== batch.length || !result.translations.every((text) => typeof text === "string")) {
            throw new Error(result.error || "The translation provider returned an invalid response.");
          }
          const translatedValues = result.translations as string[];
          batch.forEach(([key, record], index) => {
            const translated = decodeTranslation(translatedValues[index]);
            translations.set(key, translated);
            if (translations.size > MAX_CACHED_TRANSLATIONS) {
              const oldest = translations.keys().next().value;
              if (oldest !== undefined) translations.delete(oldest);
            }
            if (!controller.signal.aborted) {
              record.apply(translated);
              record.lastApplied = translated;
            }
          });
          inFlightKeys = [];
        }
        if (!controller.signal.aborted) sendStatus({ language: target, status: "ready" });
      } catch (error) {
        if (controller.signal.aborted) return;
        const message = error instanceof Error ? error.message : "Translation failed.";
        inFlightKeys.forEach((key) => failed.add(key));
        inFlightKeys = [];
        queued.forEach((record, key) => failed.add(key));
        queued.clear();
        providerFailed = true;
        sendStatus({ language: target, status: "error", message });
      } finally {
        draining = false;
        if (queued.size && !controller.signal.aborted) scheduleDrain();
      }
    }

    const restoreOriginalContent = () => {
      const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT);
      let node = walker.nextNode();
      while (node) {
        const record = textRecords.get(node as Text);
        if (record) {
          record.apply(record.original);
          record.lastApplied = record.original;
        }
        node = walker.nextNode();
      }
      document.documentElement.querySelectorAll("*").forEach((element) => {
        attributeRecords.get(element)?.forEach((record) => {
          record.apply(record.original);
          record.lastApplied = record.original;
        });
      });
    };
    if (target !== "en") restoreOriginalContent();

    if (target !== "en") {
      scan(document.documentElement);
    } else {
      sendStatus({ language: target, status: "ready" });
    }

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") recordText(mutation.target as Text);
        if (mutation.type === "attributes" && mutation.target instanceof Element && mutation.attributeName) {
          recordAttribute(mutation.target, mutation.attributeName);
        }
        mutation.addedNodes.forEach(scan);
      }
    });
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [...ATTRIBUTE_NAMES],
    });

    return () => {
      controller.abort();
      observer.disconnect();
    };
  }, [target, retry]);

  return null;
}
