class SlovnykContent {
  rootSpanClass = '__slovnyk';
  tooltipSpanClass = '__slovnyk__tooltip';

  initHandlers() {
    chrome.runtime.onMessage.addListener(request => {
      if (request.slovnykContentEvent) {
        this[request.slovnykContentEvent.method](...[].concat(request.slovnykContentEvent.args || []));
      }
    });
  }

  callBg(method, args = null) {
    chrome.runtime.sendMessage({ slovnykBgEvent: { method: method, args: args } });
  }

  replaceWords(dictionary) {
    this.dictionary = dictionary;
    let wordsMap = dictionary.wordsMap;
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
        let newOffset = match.index + match[0].length;
        fragment = fragment || document.createDocumentFragment();
        fragment.appendChild(document.createTextNode(fullNodeText.slice(offset, match.index)));
        let rootSpan = document.createElement('span');
        rootSpan.className = this.rootSpanClass;
        rootSpan.appendChild(document.createTextNode(fullNodeText.slice(match.index, newOffset)));
        let tooltipSpan = document.createElement('span');
        tooltipSpan.className = this.tooltipSpanClass;
        tooltipSpan.appendChild(document.createTextNode(wordsMap[match[0]]));
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
    let words = Object.keys(this.dictionary.wordsMap);
    words.sort((a, b) => b.length - a.length);
    words = words.map(s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')); // escape words for Regexp
    return words.join('|');
  }
}

let slovnykContent = new SlovnykContent();
window.SlovnykContent = slovnykContent;

slovnykContent.initHandlers();
slovnykContent.callBg('ensureVocabularyAndCallContent');
