'use babel';

import findRelatedFiles from 'ember-find-related-files';
import { CompositeDisposable } from 'atom';
import quickSelect from 'atom-quick-select';

export default {

  subscriptions: null,

  activate(state) {
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'ember-related-files:show': () => this.show()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  async show() {
    const editor = atom.workspace.getActiveTextEditor()
    if (!editor) { return }
    
    const filePath = editor.getPath()
    if (!filePath) { return }
    
    const rootPath = atom.project.getDirectories()
      .map((d) => `${d.path}/`)
      .find((rootPath) => filePath.indexOf(rootPath) === 0)
      
    if (!rootPath) { return }
    
    const items = findRelatedFiles(rootPath, filePath.replace(rootPath, ''));
    if (!items.length) { return }
    
    // TODO: Config
    if (items.length === 1) {
      return this.openPath(items[0].path)
    }
    
    const selection = await quickSelect(items.map(({ label, path }) => ({ label, description: path })))
    if (selection) {
      return this.openPath(selection.description)
    }
  },
  
  async openPath(filePath) {
    return await atom.workspace.open(filePath, { searchAllPanes: true })
  }
};
