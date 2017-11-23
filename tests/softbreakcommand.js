import ModelTestEditor from './_utils/modeltesteditor';
import SoftBreakCommand from '../src/softbreakcommand';
import InsertDelta from '@ckeditor/ckeditor5-engine/src/model/delta/insertdelta';
import { getData, setData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

describe( 'SoftBreakCommand', () => {
	let editor, doc, schema, command;

	beforeEach( () => {
		return ModelTestEditor.create()
			.then( newEditor => {
				editor = newEditor;
				doc = editor.document;

				command = new SoftBreakCommand( editor );
				editor.commands.add( 'softLineBreak', command );

				schema = doc.schema;

				// Note: We could use real names like 'paragraph', but that would make test patterns too long.
				// Plus, this is actually a good test that the algorithm can be used for any model.
				schema.registerItem( 'img', '$inline' );
				schema.registerItem( 'p', '$block' );
				schema.registerItem( 'h', '$block' );
				schema.registerItem( 'inlineLimit' );
				schema.registerItem( 'blockLimit' );

				schema.allow( { name: 'inlineLimit', inside: 'p' } );
				schema.allow( { name: '$text', inside: 'inlineLimit' } );
				schema.allow( { name: '$text', inside: '$root' } );
				schema.allow( { name: 'blockLimit', inside: '$root' } );
				schema.allow( { name: 'p', inside: 'blockLimit' } );

				schema.limits.add( 'inlineLimit' );
				schema.limits.add( 'blockLimit' );
			} );
	} );

	describe( 'SoftBreakCommand', () => {
		it( 'inserts a soft break using enqueueChanges', () => {
			setData( doc, '<p>foo[]</p>' );

			doc.enqueueChanges( () => {
				editor.execute( 'softLineBreak' );

				// We expect that command is executed in enqueue changes block. Since we are already in
				// an enqueued block, the command execution will be postponed. Hence, no changes.
				expect( getData( doc, { withoutSelection: true } ) ).to.equal( '<p>foo</p>' );
			} );

			// After all enqueued changes are done, the command execution is reflected.
			expect( getData( doc, { withoutSelection: true } ) ).to.equal( '<p>foo<softLineBreak></softLineBreak></p>' );
		} );

		// it( 'creates InsertDelta if enter is at the beginning of block', () => {
		// 	setData( doc, '<p>[]foo</p>' );
		//
		// 	editor.execute( 'enter' );
		//
		// 	const deltas = Array.from( doc.history.getDeltas() );
		//
		// 	expect( deltas[ deltas.length - 1 ] ).to.be.instanceof( InsertDelta );
		// } );

		it( 'creates InsertDelta when soft break triggered', () => {
			setData( doc, '<p>foo[]</p>' );

			editor.execute( 'softLineBreak' );

			const deltas = Array.from( doc.history.getDeltas() );

			expect( deltas[ deltas.length - 1 ] ).to.be.instanceof( InsertDelta );
		} );
	} );

	// describe( 'execute()', () => {
	// 	describe( 'collapsed selection', () => {
	// 		test(
	// 			'does nothing in the root',
	// 			'foo[]bar',
	// 			'foo[]bar'
	// 		);
	//
	// 		test(
	// 			'splits block',
	// 			'<p>x</p><p>foo[]bar</p><p>y</p>',
	// 			'<p>x</p><p>foo</p><p>[]bar</p><p>y</p>'
	// 		);
	//
	// 		test(
	// 			'splits block at the end',
	// 			'<p>x</p><p>foo[]</p><p>y</p>',
	// 			'<p>x</p><p>foo</p><p>[]</p><p>y</p>'
	// 		);
	//
	// 		test(
	// 			'splits block at the beginning',
	// 			'<p>x</p><p>[]foo</p><p>y</p>',
	// 			'<p>x</p><p></p><p>[]foo</p><p>y</p>'
	// 		);
	//
	// 		test(
	// 			'inserts new block after empty one',
	// 			'<p>x</p><p>[]</p><p>y</p>',
	// 			'<p>x</p><p></p><p>[]</p><p>y</p>'
	// 		);
	// 	} );
	//
	// 	describe( 'non-collapsed selection', () => {
	// 		test(
	// 			'only deletes the content when directly in the root',
	// 			'fo[ob]ar',
	// 			'fo[]ar'
	// 		);
	//
	// 		test(
	// 			'deletes text and splits',
	// 			'<p>ab[cd]ef</p><p>ghi</p>',
	// 			'<p>ab</p><p>[]ef</p><p>ghi</p>'
	// 		);
	//
	// 		test(
	// 			'places selection in the 2nd element',
	// 			'<h>ab[c</h><p>d]ef</p><p>ghi</p>',
	// 			'<h>ab</h><p>[]ef</p><p>ghi</p>'
	// 		);
	//
	// 		test(
	// 			'leaves one empty element after one was fully selected',
	// 			'<p>x</p><p>[abcdef]</p><p>y</p>',
	// 			'<p>x</p><p>[]</p><p>y</p>'
	// 		);
	//
	// 		test(
	// 			'leaves one empty element after two were fully selected',
	// 			'<p>[abc</p><p>def]</p>',
	// 			'<p>[]</p>'
	// 		);
	//
	// 		test(
	// 			'should not break inline limit elements - collapsed',
	// 			'<p><inlineLimit>foo[]bar</inlineLimit></p>',
	// 			'<p><inlineLimit>foo[]bar</inlineLimit></p>'
	// 		);
	//
	// 		test(
	// 			'should not break inline limit elements',
	// 			'<p><inlineLimit>foo[bar]baz</inlineLimit></p>',
	// 			'<p><inlineLimit>foo[]baz</inlineLimit></p>'
	// 		);
	//
	// 		test(
	// 			'should not break inline limit elements - selection partially inside',
	// 			'<p><inlineLimit>ba[r</inlineLimit></p><p>f]oo</p>',
	// 			'<p><inlineLimit>ba[r</inlineLimit></p><p>f]oo</p>'
	// 		);
	//
	// 		test(
	// 			'should break paragraph in blockLimit',
	// 			'<blockLimit><p>foo[]bar</p></blockLimit>',
	// 			'<blockLimit><p>foo</p><p>[]bar</p></blockLimit>'
	// 		);
	//
	// 		it( 'leaves one empty element after two were fully selected (backward)', () => {
	// 			setData( doc, '<p>[abc</p><p>def]</p>' );
	// 			// @TODO: Add option for setting selection direction to model utils.
	// 			doc.selection._lastRangeBackward = true;
	//
	// 			command.execute();
	//
	// 			expect( getData( doc ) ).to.equal( '<p>[]</p>' );
	// 		} );
	//
	// 		it( 'uses DataController.deleteContent', () => {
	// 			const spy = sinon.spy();
	//
	// 			editor.data.on( 'deleteContent', spy );
	//
	// 			setData( doc, '<p>[x]</p>' );
	//
	// 			command.execute();
	//
	// 			expect( spy.calledOnce ).to.be.true;
	// 		} );
	// 	} );
	//
	// 	function test( title, input, output ) {
	// 		it( title, () => {
	// 			setData( doc, input );
	//
	// 			command.execute();
	//
	// 			expect( getData( doc ) ).to.equal( output );
	// 		} );
	// 	}
	// } );
} );
