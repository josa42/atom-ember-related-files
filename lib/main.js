'use babel'

import { findRelatedFiles, findType } from 'ember-find-related-files'
import { CompositeDisposable } from 'atom'
import quickSelect from 'atom-quick-select'
import getEditorPaths from './utils/get-editor-paths'

const TYPES = [
  'adapter',
  'component',
  'controller',
  'helper',
  'initializer',
  'mixin',
  'model',
  'route',
  'serializer',
  'service'
]

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

    const commands = {
      'ember-related-files:show': () => this.show()
    }

    TYPES.forEach((type) =>
      (commands[`ember-related-files:show-${type}-list`] = () => this.showTypeList(type))
    )

    this.subscriptions.add(atom.commands.add('atom-workspace', commands))
  },

  deactivate () {
    this.subscriptions.dispose()
  },

  async show () {
    const { rootPath, filePath } = getEditorPaths()
    if (!rootPath || !filePath) { return }

    const items = findRelatedFiles(rootPath, filePath.replace(rootPath, ''))
    if (!items.length) { return }

    return this.showQuickSelect(
      items, ({ label, path }) => ({ label, description: path })
    )
  },

  async showTypeList (type) {
    const { rootPath } = getEditorPaths()
    if (!rootPath) { return }

    const items = await findType(rootPath, type)
    if (!items.length) { return }

    return this.showQuickSelect(
      items, ({ label, path }) => ({ label, description: path })
    )
  },

  async showQuickSelect (items, mapFn) {
    const showQuickPickForSingleOption = atom.config.get('ember-related-files.showQuickPickForSingleOption')
    if (showQuickPickForSingleOption && items.length === 1) {
      return this.openPath(items[0].path)
    }

    const selection = await quickSelect(items.map(mapFn))
    if (selection) {
      return this.openPath(selection.description)
    }
  },

  async openPath (filePath) {
    return atom.workspace.open(filePath, { searchAllPanes: true })
  }
}
