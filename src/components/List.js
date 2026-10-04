import { qs, clear } from '../utils/dom.js';
import { renderListItem } from './ListItem.js';

const VISIBILITY_KEY = 'quickcopy.answerVisibility';

function loadVisibilityPreferences() {
  try {
    const stored = JSON.parse(localStorage.getItem(VISIBILITY_KEY) || '{}');
    return Object.fromEntries(
      Object.entries(stored).filter(([, visible]) => typeof visible === 'boolean')
    );
  } catch {
    return {};
  }
}

/**
 * List
 * ----
 * Renders the alphabetized, filterable list of saved answers.
 * Receives plain data + handlers — it owns no state of its own,
 * making it easy to re-render on demand from the app controller.
 */
export class List {
  constructor(listSelector = '#extList', emptySelector = '#emptyState', countSelector = '#itemCount') {
    this._listEl = qs(listSelector);
    this._emptyEl = qs(emptySelector);
    this._countEl = qs(countSelector);
    this._visibilityById = loadVisibilityPreferences();
  }

  /**
   * @param {Array<{id:string,key:string,value:string}>} answers
   * @param {string} filterText
   * @param {'preview'|'compact'} density
   * @param {{onCopy:Function, onDelete:Function}} handlers
   */
  render(answers, filterText, density, handlers) {
    const answerIds = new Set(answers.map((answer) => answer.id));
    let preferencesChanged = false;
    Object.keys(this._visibilityById).forEach((id) => {
      if (!answerIds.has(id)) {
        delete this._visibilityById[id];
        preferencesChanged = true;
      }
    });
    if (preferencesChanged) this._saveVisibilityPreferences();

    const filtered = answers.filter((a) =>
      a.key.toLowerCase().includes(filterText.trim().toLowerCase())
    );

    clear(this._listEl);

    if (filtered.length === 0) {
      this._emptyEl.style.display = 'flex';
      this._listEl.style.display = 'none';
    } else {
      this._emptyEl.style.display = 'none';
      this._listEl.style.display = 'block';
      filtered.forEach((answer) => {
        this._listEl.appendChild(renderListItem(answer, density, {
          ...handlers,
          isVisible: this._visibilityById[answer.id] ?? true,
          onToggleVisibility: (id, update) => {
            const previous = this._visibilityById[id] ?? true;
            this._visibilityById[id] = update(previous);
            this._saveVisibilityPreferences();
            return this._visibilityById[id];
          },
        }));
      });
    }

    this._countEl.textContent = `${filtered.length} saved answer${filtered.length !== 1 ? 's' : ''}`;
  }

  _saveVisibilityPreferences() {
    try {
      localStorage.setItem(VISIBILITY_KEY, JSON.stringify(this._visibilityById));
    } catch {
      // The preference remains active for this popup session if storage is unavailable.
    }
  }
}
