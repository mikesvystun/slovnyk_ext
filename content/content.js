class SlovnykContent {
  rootSpanClass = '__slovnyk';
  tooltipSpanClass = '__slovnyk__tooltip';

  replaceWords({ pairs }) {
    this.pairs = pairs;
    this.clearAllCache();
    let wordsRegexpString = this.composeWordsRegexpString();

    let wordsRegexp = new RegExp(`(?<=^|[^а-яїієґ])(?:${wordsRegexpString})(?=$|[^а-яїієґ])`, 'gi');
    let ukLetterRegexp = /[а-яїієґ]/i;

    let treeWalker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let textNode;
    let changes = [];

    while ((textNode = treeWalker.nextNode())) {
      let fullNodeText = textNode.textContent;
      if (!fullNodeText.match(ukLetterRegexp) || textNode.parentNode.classList.contains(this.rootSpanClass)) {
        continue;
      }
      let match;
      let fragment = null;
      let offset = 0;
      while ((match = wordsRegexp.exec(fullNodeText))) {
        let word = match[0].toLowerCase();
        let translation = this.findTranslationByWord(word);
        if (!translation) {
          continue;
        }
        let newOffset = match.index + word.length;
        fragment = fragment || document.createDocumentFragment();
        fragment.appendChild(document.createTextNode(fullNodeText.slice(offset, match.index)));
        let rootSpan = document.createElement('span');
        rootSpan.className = this.rootSpanClass;
        rootSpan.appendChild(document.createTextNode(fullNodeText.slice(match.index, newOffset)));
        let tooltipSpan = document.createElement('span');
        tooltipSpan.className = this.tooltipSpanClass;
        tooltipSpan.appendChild(document.createTextNode(translation));
        rootSpan.appendChild(tooltipSpan);
        fragment.appendChild(rootSpan);
        offset = newOffset;
      }
      if (fragment) {
        let remaining;
        if ((remaining = fullNodeText.slice(offset))) {
          fragment.appendChild(document.createTextNode(remaining));
        }
        changes.push([textNode, fragment]);
      }
    }
    changes.forEach(([textNode, fragment]) => {
      textNode.parentNode.insertBefore(fragment, textNode);
      textNode.parentNode.removeChild(textNode);
    });
  }

  composeWordsRegexpString() {
    return Object
      .keys(this.pairs)
      .map(s => this.escapeRegexSpecialSymbols(s))
      .map(s => this.composeSimilarWordRegexpStr(s))
      .join('|');
  }

  escapeRegexSpecialSymbols(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  composeSimilarWordRegexpStr(str) {
    return str.replace(/[іигґх]/g, c => c === 'і' || c === 'и' ? '[іи]' : '[гґх]');
  }

  findTranslationByWord(word) {
    let translation = this.pairs[word];
    if (!translation) {
      let indexLookupRegex = new RegExp(`${this.composeSimilarWordRegexpStr(word)}=(\\d+)`);
      let m = this.tranIndexLookupStr.match(indexLookupRegex);
      if (m) {
        let translationIndex = +m[1];
        translation = this.allTranslations[translationIndex];
      }
    }
    return translation;
  }

  get tranIndexLookupStr() {
    if (!this._tranIndexLookupStr) {
      this._tranIndexLookupStr = Object
        .keys(this.pairs)
        .map(k => this.escapeRegexSpecialSymbols(k))
        .map((k, i) => `${k}=${i}`)
        .join('|');
    }
    return this._tranIndexLookupStr;
  }

  get allTranslations() {
    if (!this._allTranslations) {
      this._allTranslations = Object.values(this.pairs);
    }
    return this._allTranslations;
  }

  clearAllCache() {
    this._tranIndexLookupStr = null;
    this._allTranslations = null;
  }
}

chrome.storage.local.get(['slovnykEnabled', 'dictionary'], data => {
  if (data.slovnykEnabled) {
    if (!window.SlovnykContent) {
      window.SlovnykContent = new SlovnykContent();
    }
    if (data.dictionary) {
      window.SlovnykContent.replaceWords(data.dictionary);
    }
  }
});
