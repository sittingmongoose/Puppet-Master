/* Rules the shell applies at run time that the fixture does not spell out row by row.

   PMR.fileQuick(item): the per-row quick actions of a File Manager tree row, exactly as the shell builds them
   (pm6-js-cozy-shelves buildTrails): folders get New file here / New folder here / Open in terminal; changed files
   Stage changes / Open diff / Discard changes; read-only files Save local copy; other files Add to chat / Copy relative
   path / Open in terminal. Concepts render these instead of the static `quick` list the markup carried, because the
   shell replaces that list at boot; the acceptance check compares against the live page. */
PMR.fileQuick = function fileQuick(item) {
  if (!item) return [];
  const at = item.attrs || {};
  const path = at['data-path'] || item.path || at['data-name'] || item.name || '';
  const kind = at['data-kind'] || (item.kind === 'folder' ? 'folder' : '');
  const git = at['data-git'] || item.letter || '';
  const ro = at['data-readonly'] === '1';
  const a = (icon, label, cmd, arg, extra) => Object.assign({ icon, label, cmd, arg }, extra || {});
  if (kind === 'folder' || item.kind === 'folder') {
    return [a('filePlus', 'New file here', 'cmd.file.new_file', 'cmd.file.new_file -> parent ' + path),
      a('folderPlus', 'New folder here', 'cmd.file.new_folder', 'cmd.file.new_folder -> parent ' + path),
      a('terminal', 'Open in terminal', 'cmd.terminal.show', 'cmd.terminal.show -> cwd ' + path)];
  }
  if (git) {
    return [a('plus', 'Stage changes', 'cmd.git.stage_hunks', 'cmd.git.stage_hunks -> ' + path),
      a('diff', 'Open diff', 'cmd.git.diff_open', 'cmd.git.diff_open -> ' + path),
      a('x', 'Discard changes', 'cmd.git.discard_hunks', 'cmd.git.discard_hunks -> ' + path + ' (confirm)', { danger: true })];
  }
  if (ro) return [a('arrowDn', 'Save local copy', 'cmd.file.save_local_copy', 'cmd.file.save_local_copy -> ' + path)];
  return [a('chat', 'Add to chat', 'cmd.chat.add_file_reference', 'cmd.chat.add_file_reference -> ' + path),
    a('copy', 'Copy relative path', 'cmd.file.copy_path', 'cmd.file.copy_path -> ' + path + ' (relative)'),
    a('terminal', 'Open in terminal', 'cmd.terminal.show', 'cmd.terminal.show -> ' + path)];
};
