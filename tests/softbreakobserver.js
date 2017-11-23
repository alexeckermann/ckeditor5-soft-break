/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ViewDocument from '@ckeditor/ckeditor5-engine/src/view/document';
import SoftBreakObserver from '../src/softbreakobserver';
import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';

describe( 'SoftBreakObserver', () => {
	let viewDocument;

	beforeEach( () => {
		viewDocument = new ViewDocument();
		viewDocument.addObserver( SoftBreakObserver );
	} );

	// See #10.
	it( 'can be initialized', () => {
		expect( () => {
			viewDocument.createRoot( document.createElement( 'div' ) );
		} ).to.not.throw();
	} );

	describe( 'shift+enter event', () => {
		it( 'is fired on keydown', () => {
			const spy = sinon.spy();

			viewDocument.on( 'softLineBreak', spy );

			viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'enter' ),
				shiftKey: true
			} ) );

			expect( spy.calledOnce ).to.be.true;
		} );

		it( 'is not fired on keydown when key event does not match shift+enter', () => {
			const spy = sinon.spy();

			viewDocument.on( 'softLineBreak', spy );

			viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: 1
			} ) );

			viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'enter' ),
				shiftKey: false
			} ) );

			expect( spy.calledOnce ).to.be.false;
		} );
	} );

	function getDomEvent() {
		return {
			preventDefault: sinon.spy()
		};
	}
} );
