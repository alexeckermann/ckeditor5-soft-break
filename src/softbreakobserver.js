import Observer from '@ckeditor/ckeditor5-engine/src/view/observer/observer';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import { keyCodes } from '@ckeditor/ckeditor5-utils/src/keyboard';

export default class SoftBreakObserver extends Observer {
	constructor( document ) {
		super( document );

		document.on( 'keydown', ( evt, data ) => {
			if ( this.isEnabled && data.keyCode == keyCodes.enter && data.shiftKey ) {
				document.fire( 'softLineBreak' );
				evt.stop();
			}
		}, { priority: 'high' } );
	}

	/**
	 * @inheritDoc
	 */
	observe() {}
}
