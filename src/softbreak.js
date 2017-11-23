import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import SoftBreakObserver from './softbreakobserver';
import SoftBreakCommand from './softbreakcommand';

import buildModelConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildmodelconverter';
import buildViewConverter from '@ckeditor/ckeditor5-engine/src/conversion/buildviewconverter';

import ViewEmptyElement from '@ckeditor/ckeditor5-engine/src/view/emptyelement';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';

export default class SoftBreak extends Plugin {

	static get pluginName() {
		return 'SoftBreak';
	}

	init() {
		const editor = this.editor;
		const doc = editor.document;
		const data = editor.data;
		const editing = editor.editing;
		const schema = doc.schema;

		schema.registerItem( 'softLineBreak', '$inline' );
		// schema.allow( { name: 'softLineBreak', inside: '$block' } );

		// Build converter from model to view for data and editing pipelines.
		buildModelConverter().for( data.modelToView, editing.modelToView )
			.fromElement( 'softLineBreak' )
			.toElement( () => new ViewEmptyElement( 'br' ) );

		// Build converter from view to model for data pipeline.
		buildViewConverter().for( data.viewToModel )
			.fromElement( 'br' )
			.toElement( 'softLineBreak' );

		editing.view.addObserver( SoftBreakObserver );

		editor.commands.add( 'softLineBreak', new SoftBreakCommand( editor ) );

		this.listenTo( editing.view, 'softLineBreak', ( evt, evtData ) => {
			editor.execute( 'softLineBreak' );
			evtData.preventDefault();
			editing.view.scrollToTheSelection();
		}, { priority: 'low' } );

	}

}
