## Soft Break feature

Test the <kbd>Shift+Enter</kbd> key support.

### Notes:

* Expected behavior:
	* Using <kbd>Shift+Enter</kbd> will insert a soft break in elements.
	* Should override the Enter plugin behavior.
	* Selections will insert a soft break at the first position, not destroy content.
* Check:
  * Multiple trailing soft breaks are easily removable.
  * Integration with undo.
