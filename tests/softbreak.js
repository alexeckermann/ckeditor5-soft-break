import ClassicTestEditor from './_utils/classictesteditor';
import SoftBreak from '../src/softbreak';
import SoftBreakCommand from '../src/softbreakcommand';
import SoftBreakObserver from '../src/softbreakobserver';

import { setData as setModelData, getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { setData as setViewData, getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

import DomEventData from '@ckeditor/ckeditor5-engine/src/view/observer/domeventdata';
import ModelRange from '@ckeditor/ckeditor5-engine/src/model/range';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';

describe( 'SoftBreak', () => {
	let editorElement, editor, document, viewDocument;

	beforeEach( () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ SoftBreak ]
			} )
			.then( newEditor => {
				editor = newEditor;
				document = editor.document;
				viewDocument = editor.editing.view;

				document.schema.registerItem( 'paragraph', '$block' );

				// Build converter from model to view for data and editing pipelines.
				buildModelConverter().for( editor.data.modelToView, editor.editing.modelToView )
					.fromElement( 'paragraph' )
					.toElement( 'p' );

				// Build converter from view to model for data pipeline.
				buildViewConverter().for( editor.data.viewToModel )
					.fromElement( 'p' )
					.toElement( 'paragraph' );

			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( SoftBreak ) ).to.instanceOf( SoftBreak );
	} );

	it( 'creates the commands', () => {
		expect( editor.commands.get( 'softLineBreak' ) ).to.be.instanceof( SoftBreakCommand );
	} );

	it( 'creates the observers', () => {
		expect( viewDocument.getObserver( SoftBreakObserver ) ).to.be.instanceof( SoftBreakObserver );
	} );

	it( 'listens to the editing view enter event', () => {
		const spy = editor.execute = sinon.spy();
		const domEvt = getDomEvent();

		viewDocument.fire( 'softLineBreak', new DomEventData( viewDocument, domEvt ) );

		expect( spy.calledOnce ).to.be.true;
		expect( spy.calledWithExactly( 'softLineBreak' ) ).to.be.true;

		expect( domEvt.preventDefault.calledOnce ).to.be.true;
	} );

	it( 'scrolls the editing document to the selection after executing the command', () => {
		const domEvt = getDomEvent();
		const executeSpy = editor.execute = sinon.spy();
		const scrollSpy = sinon.stub( viewDocument, 'scrollToTheSelection' );

		viewDocument.fire( 'softLineBreak', new DomEventData( viewDocument, domEvt ) );

		sinon.assert.calledOnce( scrollSpy );
		sinon.assert.callOrder( executeSpy, scrollSpy );
	} );

	function getDomEvent() {
		return {
			preventDefault: sinon.spy()
		};
	}

	describe( 'data converters', () => {

		it( 'view should convert to empty break tags', () => {
			setModelData( document, '<paragraph>foo<softLineBreak></softLineBreak>bar</paragraph>' );
			expect( getViewData( viewDocument, { withoutSelection: true } ) ).to.equal( '<p>foo<br />bar</p>' );
		} );

		it( 'model should convert to soft line breaks', () => {
			setViewData( viewDocument, '<p>foo<br />bar</p>' );
			expect( getModelData( document, { withoutSelection: true } ) ).to.equal( '<paragraph>foo<softLineBreak></softLineBreak>bar</paragraph>' );
		} );

	} );

} );
