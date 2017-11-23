import Command from '@ckeditor/ckeditor5-core/src/command';
import ModelElement from '@ckeditor/ckeditor5-engine/src/model/element';

export default class SoftBreakCommand extends Command {
	/**
	 * @inheritDoc
	 */
	execute() {
		const doc = this.editor.document;

		doc.enqueueChanges( () => {
			const position = doc.selection.getFirstPosition();
			const batch = doc.batch();
			const node = new ModelElement( 'softLineBreak' );
			batch.insert( position, node );
		});
	}

}
