import type { DirectoryLocale } from "@/lib/directory-i18n";

// The business portal's Tasks CRM module (list, detail, new/edit pages,
// and the shared PartnerTaskForm) — follows the same type-then-
// one-block-per-locale shape as PORTAL_CHROME_STRINGS in portal-i18n.ts /
// PORTAL_COMPANIES_STRINGS in portal-companies-i18n.ts. The list page's own
// task count is kept as a {count}-token template pair filled in by
// formatPortalTaskCount below, rather than a plain string, the same
// reasoning as formatPortalCompanyCount's own comment.
export type PortalTasksStrings = {
  // Shared page title, reused as-is for the list page's own <h1> and as
  // the "Tasks" breadcrumb entry on every other page in this module.
  tasksTitle: string;
  // {count} token — see formatPortalTaskCount below. English branches
  // singular/plural; zh/ms don't need to.
  taskCountTemplate: string;
  taskCountSingularTemplate: string;
  // Reused as-is for the list page's header action, its empty-state
  // action, and the new-task page's own breadcrumb entry and <h1> — all
  // identical copy in English today.
  newTaskCta: string;
  emptyTitle: string;
  emptyDescription: string;
  // The list page's own checkbox aria-label and the detail page's toggle
  // button text — identical copy in both places.
  markCompleteCta: string;
  markIncompleteCta: string;
  // Prefix shown before a task's relative due-date label (see
  // relativeToToday in lib/format.ts, which stays English — that helper
  // lives outside this module) once it's passed without being completed.
  overduePrefix: string;
  completedBadge: string;
  editCta: string;
  deleteCta: string;
  deleteConfirmMessage: string;
  detailsHeading: string;
  // Reused across the detail page's DetailRow labels and the form's
  // matching FieldGroup labels — identical copy in both places.
  dueDateLabel: string;
  companyLabel: string;
  contactLabel: string;
  dealLabel: string;
  descriptionLabel: string;
  editBreadcrumb: string;
  // {title} token — see formatEditTaskTitle below.
  editTaskTitleTemplate: string;
  createTaskSubmitLabel: string;
  taskTitleLabel: string;
  taskTitlePlaceholder: string;
  descriptionPlaceholder: string;
  // The form's own default submit label, used on the edit page (which
  // doesn't override submitLabel) — the new-task page overrides it with
  // createTaskSubmitLabel above instead.
  saveTaskCta: string;
  savingCta: string;
};

export const PORTAL_TASKS_STRINGS: Record<DirectoryLocale, PortalTasksStrings> = {
  en: {
    tasksTitle: "Tasks",
    taskCountTemplate: "{count} tasks",
    taskCountSingularTemplate: "1 task",
    newTaskCta: "New task",
    emptyTitle: "No tasks yet.",
    emptyDescription: "Keep track of follow-ups against your companies, contacts, and deals.",
    markCompleteCta: "Mark complete",
    markIncompleteCta: "Mark incomplete",
    overduePrefix: "Overdue: ",
    completedBadge: "Completed",
    editCta: "Edit",
    deleteCta: "Delete",
    deleteConfirmMessage: "Delete this task?",
    detailsHeading: "Details",
    dueDateLabel: "Due date",
    companyLabel: "Company",
    contactLabel: "Contact",
    dealLabel: "Deal",
    descriptionLabel: "Description",
    editBreadcrumb: "Edit",
    editTaskTitleTemplate: "Edit {title}",
    createTaskSubmitLabel: "Create task",
    taskTitleLabel: "Task",
    taskTitlePlaceholder: "Follow up on proposal",
    descriptionPlaceholder: "Any extra detail…",
    saveTaskCta: "Save task",
    savingCta: "Saving…",
  },
  zh: {
    tasksTitle: "任务",
    taskCountTemplate: "{count} 项任务",
    taskCountSingularTemplate: "1 项任务",
    newTaskCta: "新建任务",
    emptyTitle: "暂无任务。",
    emptyDescription: "记录您在公司、联系人和交易上的后续跟进事项。",
    markCompleteCta: "标记为已完成",
    markIncompleteCta: "标记为未完成",
    overduePrefix: "已逾期：",
    completedBadge: "已完成",
    editCta: "编辑",
    deleteCta: "删除",
    deleteConfirmMessage: "确定要删除此任务吗？",
    detailsHeading: "详情",
    dueDateLabel: "截止日期",
    companyLabel: "公司",
    contactLabel: "联系人",
    dealLabel: "交易",
    descriptionLabel: "描述",
    editBreadcrumb: "编辑",
    editTaskTitleTemplate: "编辑{title}",
    createTaskSubmitLabel: "创建任务",
    taskTitleLabel: "任务",
    taskTitlePlaceholder: "跟进提案进展",
    descriptionPlaceholder: "补充说明…",
    saveTaskCta: "保存任务",
    savingCta: "保存中…",
  },
  ms: {
    tasksTitle: "Tugasan",
    taskCountTemplate: "{count} tugasan",
    taskCountSingularTemplate: "1 tugasan",
    newTaskCta: "Tugasan baharu",
    emptyTitle: "Belum ada tugasan.",
    emptyDescription: "Jejaki tindakan susulan terhadap syarikat, kenalan dan tawaran anda.",
    markCompleteCta: "Tandakan selesai",
    markIncompleteCta: "Tandakan belum selesai",
    overduePrefix: "Tertunggak: ",
    completedBadge: "Selesai",
    editCta: "Edit",
    deleteCta: "Padam",
    deleteConfirmMessage: "Padam tugasan ini?",
    detailsHeading: "Butiran",
    dueDateLabel: "Tarikh akhir",
    companyLabel: "Syarikat",
    contactLabel: "Kenalan",
    dealLabel: "Tawaran",
    descriptionLabel: "Penerangan",
    editBreadcrumb: "Edit",
    editTaskTitleTemplate: "Edit {title}",
    createTaskSubmitLabel: "Cipta tugasan",
    taskTitleLabel: "Tugasan",
    taskTitlePlaceholder: "Susulan mengenai cadangan",
    descriptionPlaceholder: "Sebarang butiran tambahan…",
    saveTaskCta: "Simpan tugasan",
    savingCta: "Menyimpan…",
  },
};

export function getPortalTasksStrings(locale: DirectoryLocale): PortalTasksStrings {
  return PORTAL_TASKS_STRINGS[locale];
}

// Fills in taskCountTemplate/taskCountSingularTemplate's {count} token for
// the list page's own "N tasks" line — English pluralizes, zh/ms don't,
// same branching reasoning as formatPortalCompanyCount in
// portal-companies-i18n.ts.
export function formatPortalTaskCount(count: number, locale: DirectoryLocale): string {
  const t = PORTAL_TASKS_STRINGS[locale];
  if (count === 1) return t.taskCountSingularTemplate;
  return t.taskCountTemplate.replace("{count}", String(count));
}

// Fills in editTaskTitleTemplate's {title} token with the task's own title
// (see the edit page's own "Edit {title}" title).
export function formatEditTaskTitle(template: string, title: string): string {
  return template.replace("{title}", title);
}
