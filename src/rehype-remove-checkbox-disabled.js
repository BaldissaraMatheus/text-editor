/**
 * @import {Properties, Root} from 'hast'
 */

import {visit} from 'unist-util-visit'

export function rehypeRemoveCheckboxDisabled() {
  /**
   * @param {Root} tree
   *   Tree.
   * @returns {undefined}
   *   Nothing.
   */
  return function (tree) {

    const check = String((el, e) => {
      if (this.checked) {
        this.setAttribute("checked", "");
      } else {
        this.removeAttribute("checked");
      }
    })

    visit(tree, 'element', (node, _index, parent) => {
			if (node.tagName !== 'input') {
        return;
      }
      delete node.properties.disabled
      node.properties.onclick = `(${check})(this, event)`;
    })
	}
}