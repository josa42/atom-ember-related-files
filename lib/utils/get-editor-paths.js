'use babel'

export default function getEditorPaths () {
  const editor = atom.workspace.getActiveTextEditor()
  if (!editor) { return {} }

  const filePath = editor.getPath()
  if (!filePath) { return {} }

  const rootPath = atom.project.getDirectories()
    .map((d) => `${d.path}/`)
    .find((rootPath) => filePath.indexOf(rootPath) === 0)

  return { rootPath, filePath }
}
