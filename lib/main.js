'use babel'

import findRelatedFiles from 'ember-find-related-files'
import { CompositeDisposable } from 'atom'
import quickSelect from 'atom-quick-select'

export default {

  subscriptions: null,

  config: {
    showQuickPickForSingleOption: {
      type: 'boolean',
      default: true
    }
  },

  activate (state) {
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'ember-related-files:show': () => this.show()
    }))
  },

  deactivate () {
    this.subscriptions.dispose()
  },

  async show () {
    const editor = atom.workspace.getActiveTextEditor()
    if (!editor) { return }

    const filePath = editor.getPath()
    if (!filePath) { return }

    const rootPath = atom.project.getDirectories()
      .map((d) => `${d.path}/`)
      .find((rootPath) => filePath.indexOf(rootPath) === 0)

    if (!rootPath) { return }

    const items = findRelatedFiles(rootPath, filePath.replace(rootPath, ''))
    if (!items.length) { return }

    const showQuickPickForSingleOption = atom.config.get('ember-related-files.showQuickPickForSingleOption')
    if (showQuickPickForSingleOption && items.length === 1) {
      return this.openPath(items[0].path)
    }

    const selection = await quickSelect(items.map(({ label, path }) => ({ label, description: path })))
    if (selection) {
      return this.openPath(selection.description)
    }
  },

  async openPath (filePath) {
    return atom.workspace.open(filePath, { searchAllPanes: true })
  }
}
