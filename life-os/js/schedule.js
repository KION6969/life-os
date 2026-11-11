/* ============================================================
   LIFE OS — schedule: add, edit, delete and reset day blocks
   ============================================================ */
(function () {
  'use strict';
  const LOS = window.LOS;
  const { $, $$, esc, icon } = LOS;

  const form = () => document.getElementById('scheduleForm');
  const sortBlocks = (blocks) => blocks.slice().sort((a, b) => LOS.parseHM(a.start) - LOS.parseHM(b.start));
  const typeLabel = (id) => (LOS.SCHEDULE_TYPES.find((t) => t.id === id) || LOS.SCHEDULE_TYPES[0]).label;

  function resetForm() {
    const f = form();
    if (!f) return;
    f.reset();
    f.elements.id.value = '';
    const cancel = document.getElementById('scheduleCancel');
    if (cancel) cancel.hidden = true;
    const label = document.getElementById('scheduleSubmitLabel');
    if (label) label.textContent = 'Add block';
    const title = document.getElementById('scheduleTitle');
    if (title) title.textContent = 'Edit timetable';
  }

  function renderList() {
    const box = document.getElementById('scheduleList');
    if (!box) return;
    const blocks = LOS.db.schedule;
    if (!blocks.length) {
      box.innerHTML = `<div class="empty" style="padding:22px 12px">${icon('calendar')}<b>No blocks yet</b><p>Add your first block above, or restore the default day plan.</p></div>`;
      return;
    }
    box.innerHTML = sortBlocks(blocks).map((b) => `
      <div class="sched-row" data-block="${esc(b.id)}">
        <span class="sched-time">${LOS.fmtTime(b.start)}<em>${LOS.fmtTime(b.end)}</em></span>
        <span class="sched-copy"><b>${esc(b.label)}</b><small>${esc(typeLabel(b.type))}</small></span>
        <button class="icon-btn" data-edit-block="${esc(b.id)}" aria-label="Edit ${esc(b.label)}">${icon('chevron')}</button>
        <button class="icon-btn danger-ghost" data-del-block="${esc(b.id)}" aria-label="Delete ${esc(b.label)}">${icon('trash')}</button>
      </div>`).join('');
  }

  function openSchedule() {
    renderList();
    resetForm();
    LOS.openModal('scheduleModal');
  }
  LOS.openSchedule = openSchedule;

  function editBlock(id) {
    const block = LOS.db.schedule.find((b) => b.id === id);
    const f = form();
    if (!block || !f) return;
    f.elements.id.value = block.id;
    f.elements.label.value = block.label;
    f.elements.start.value = block.start;
    f.elements.end.value = block.end;
    f.elements.type.value = block.type;
    const cancel = document.getElementById('scheduleCancel');
    if (cancel) cancel.hidden = false;
    const label = document.getElementById('scheduleSubmitLabel');
    if (label) label.textContent = 'Save changes';
    const title = document.getElementById('scheduleTitle');
    if (title) title.textContent = 'Edit block';
    f.elements.label.focus();
    f.elements.label.scrollIntoView({ block: 'center', behavior: LOS.db.prefs.motion === false ? 'auto' : 'smooth' });
  }

  function saveBlock(e) {
    e.preventDefault();
    const f = form();
    if (!f) return;
    const data = {
      id: f.elements.id.value,
      label: String(f.elements.label.value || '').trim().slice(0, 60),
      start: f.elements.start.value,
      end: f.elements.end.value,
      type: f.elements.type.value
    };
    if (!data.label) { LOS.toast('Give the block a name', 'warn'); return; }
    if (!data.start || !data.end) { LOS.toast('Set a start and end time', 'warn'); return; }
    if (LOS.parseHM(data.end) <= LOS.parseHM(data.start)) {
      LOS.toast('End time must be after start time', 'warn', 3200);
      return;
    }

    if (data.id) {
      const block = LOS.db.schedule.find((b) => b.id === data.id);
      if (block) {
        block.label = data.label;
        block.start = data.start;
        block.end = data.end;
        block.type = data.type;
      }
      LOS.toast(`Saved ${data.label}`, 'ok', 2000);
    } else {
      LOS.db.schedule.push({ id: LOS.uid(), label: data.label, start: data.start, end: data.end, type: data.type });
      LOS.toast(`Added ${data.label} · ${LOS.fmtTime(data.start)}`, 'ok', 2200);
    }

    LOS.db.schedule = sortBlocks(LOS.db.schedule);
    LOS.save();
    if (LOS.currentPage === 'home') LOS.renderHome();
    renderList();
    resetForm();
  }

  function deleteBlock(id) {
    const block = LOS.db.schedule.find((b) => b.id === id);
    if (!block) return;
    LOS.confirmAction('Delete this block?', `"${block.label}" will be removed from your timetable.`, 'Delete block', () => {
      LOS.db.schedule = LOS.db.schedule.filter((b) => b.id !== id);
      LOS.save();
      if (LOS.currentPage === 'home') LOS.renderHome();
      renderList();
      resetForm();
      if (!LOS.db.schedule.length) LOS.toast('Timetable is empty — add a block or reset the default', 'warn', 3800);
      else LOS.toast(`${block.label} removed`, 'warn', 2000);
    });
  }

  function resetSchedule() {
    LOS.confirmAction('Restore the default day?', 'Your current blocks will be replaced by the built-in study / gym / meal structure.', 'Restore default', () => {
      LOS.db.schedule = LOS.DEFAULT_SCHEDULE.map((s) => ({ ...s }));
      LOS.save();
      if (LOS.currentPage === 'home') LOS.renderHome();
      renderList();
      resetForm();
      LOS.toast('Default timetable restored', 'ok', 2400);
    });
  }

  /* ---------------- wiring ---------------- */
  const f = form();
  if (f) f.addEventListener('submit', saveBlock);

  const cancel = document.getElementById('scheduleCancel');
  if (cancel) cancel.addEventListener('click', resetForm);

  const reset = document.getElementById('scheduleReset');
  if (reset) reset.addEventListener('click', resetSchedule);

  document.addEventListener('click', (e) => {
    if (e.target.closest('#editSchedule')) { openSchedule(); return; }

    const edit = e.target.closest('[data-edit-block]');
    if (edit) { editBlock(edit.dataset.editBlock); return; }

    const del = e.target.closest('[data-del-block]');
    if (del) { deleteBlock(del.dataset.delBlock); return; }
  });
})();
