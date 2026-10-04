import { el } from '../utils/dom.js';

function initials(text) {
  return text.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();
}

/**
 * Builds the DOM node for one answer row.
 * @param {{id:string,key:string,value:string}} answer
 * @param {'preview'|'compact'} density
 * @param {{onCopy:Function, onDelete:Function, isVisible:boolean, onToggleVisibility:Function}} handlers
 */
export function renderListItem(answer, density, { onCopy, onDelete, isVisible, onToggleVisibility }) {
  const bodyChildren = [el('div', { class: 'kv-key' }, [answer.key])];
  let visibilityBtn;
  if (density === 'preview') {
    const valueInput = el('input', {
      class: 'kv-value-preview',
      type: isVisible ? 'text' : 'password',
      value: answer.value,
      readonly: '',
      tabindex: '-1',
      'aria-label': `${answer.key} value`,
    });
    visibilityBtn = el('button', {
      class: `kv-visibility${isVisible ? '' : ' is-hidden'}`,
      type: 'button',
      title: isVisible ? 'Hide value' : 'Show value',
      'aria-label': isVisible ? 'Hide value' : 'Show value',
      onClick: (e) => {
        e.stopPropagation();
        const visible = onToggleVisibility(answer.id, (previous) => !previous);
        valueInput.type = visible ? 'text' : 'password';
        visibilityBtn.textContent = visible ? 'Hide' : 'Show';
        visibilityBtn.title = visible ? 'Hide value' : 'Show value';
        visibilityBtn.setAttribute('aria-label', visibilityBtn.title);
      },
    }, [isVisible ? 'Hide' : 'Show']);
    bodyChildren.push(valueInput);
  }

  const body = el('div', { class: 'kv-body', onClick: () => onCopy(answer) }, bodyChildren);
  const icon = el('div', { class: 'kv-icon', onClick: () => onCopy(answer) }, [initials(answer.key)]);
  const deleteBtn = el('div', { class: 'kv-delete', title: 'Delete', onClick: (e) => {
    e.stopPropagation();
    onDelete(answer);
  } }, ['✕']);
  const actions = el('div', { class: 'kv-actions' }, [
    ...(visibilityBtn ? [visibilityBtn] : []),
    deleteBtn,
  ]);

  return el('div', { class: 'kv-item' }, [icon, body, actions]);
}
