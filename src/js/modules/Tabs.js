const instances = {};

// `[data-tabs="<id>"]` holds `[data-tab="<n>"]` triggers that switch
// `[data-tabs-contents="<id>"] [data-tab-content="<n>"]` by toggling `.active`
export default class TabsController {
  constructor({ id, $triggers, $contents }) {
    this.id = id;
    this.$triggers = $triggers;
    this.$contents = $contents;

    this.$triggers.forEach(($trigger) => $trigger.addEventListener('click', () => this.open($trigger)));
    this.open(this.$triggers[0]);

    instances[this.id] = this;
  }

  open($trigger) {
    const tab = $trigger.getAttribute('data-tab');

    this.$triggers.forEach(($el) => setActive($el, $el === $trigger));
    this.$contents.forEach(($el) => setActive($el, $el.getAttribute('data-tab-content') === tab));
  }

  static open(id, $trigger) {
    instances[id].open($trigger);
  }
}

function setActive($el, isActive) {
  if (isActive) {
    $el.classList.add('active');
  } else {
    $el.classList.remove('active');
  }
}

export function initTabs() {
  document.querySelectorAll('[data-tabs]').forEach(($triggersWrap) => {
    const id = $triggersWrap.getAttribute('data-tabs');
    const $contentsWrap = document.querySelector(`[data-tabs-contents="${id}"]`);

    if (!$contentsWrap) return;

    // eslint-disable-next-line no-new
    new TabsController({
      id,
      $triggers: [...$triggersWrap.querySelectorAll('[data-tab]')],
      $contents: [...$contentsWrap.querySelectorAll('[data-tab-content]')],
    });
  });
}
