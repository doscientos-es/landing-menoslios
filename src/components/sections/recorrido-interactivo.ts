import { demoCases, demoEuros, type DemoCase } from '../../config/product-demo';

const ids = ['presupuesto', 'agenda', 'parte', 'factura'] as const;
const quoteStatus = { pending: 'Por responder', question: 'Con una duda', accepted: 'Aceptado' };
type QuoteStatus = keyof typeof quoteStatus;

type DemoState = {
  quote: QuoteStatus;
  asked: boolean;
  assignment: { person: string; slot: string } | null;
  checks: Set<number>;
  saved: boolean;
  closed: boolean;
  invoice: boolean;
  paid: number;
};
const fresh = (): DemoState => ({
  quote: 'pending', asked: false, assignment: null, checks: new Set(),
  saved: false, closed: false, invoice: false, paid: 0,
});

for (const root of document.querySelectorAll<HTMLElement>('[data-recorrido]')) {
  const interactive = root.querySelector<HTMLElement>('[data-recorrido-interactive]');
  const fallback = root.querySelector<HTMLDetailsElement>('[data-recorrido-fallback]');
  const announcement = root.querySelector<HTMLElement>('[data-recorrido-anuncio]');
  const tabs = [...root.querySelectorAll<HTMLButtonElement>('[data-demo-tab]')];
  const panels = [...root.querySelectorAll<HTMLElement>('[data-recorrido-panel]')];
  const checks = [...root.querySelectorAll<HTMLInputElement>('[data-recorrido-comprobacion]')];
  const radios = [...root.querySelectorAll<HTMLInputElement>('input[name="recorrido-case"]')];
  const person = root.querySelector<HTMLSelectElement>('[data-demo-select="person"]');
  const slot = root.querySelector<HTMLSelectElement>('[data-demo-select="slot"]');
  if (!interactive || !fallback || !announcement || !person || !slot ||
      tabs.length !== ids.length || panels.length !== ids.length || checks.length !== 2) continue;

  const bind = new Map<string, HTMLElement[]>();
  for (const element of root.querySelectorAll<HTMLElement>('[data-demo-value]')) {
    const key = element.dataset.demoValue;
    if (key) bind.set(key, [...(bind.get(key) ?? []), element]);
  }
  const visibility = [...root.querySelectorAll<HTMLElement>('[data-demo-if]')];
  const actions = [...root.querySelectorAll<HTMLButtonElement>('[data-demo-action]')];
  const nextButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-demo-next]')];
  const requested = new URLSearchParams(window.location.search).get('ejemplo');
  let variation: DemoCase = demoCases.find(({ id }) => id === requested) ?? demoCases[0];
  let stage = 0;
  let state = fresh();

  function say(message: string) {
    if (announcement) announcement.textContent = message;
  }

  function chooseOptions() {
    person?.replaceChildren(...variation.people.map((name) => new Option(name, name)));
    slot?.replaceChildren(...variation.slots.map((time) => new Option(time, time)));
  }

  function render() {
    const accepted = state.quote === 'accepted';
    const assigned = state.assignment !== null;
    const remaining = variation.price - state.paid;
    const workStatus = !assigned ? 'Pendiente' : state.closed ? 'Cerrado' :
      state.saved ? 'Borrador guardado' : state.checks.size ? 'Sin guardar' : 'Sin empezar';
    const invoiceStatus = !state.invoice ? 'Sin preparar' :
      remaining === 0 ? 'Cobrada' : state.paid > 0 ? 'Cobro parcial' : 'Pendiente de cobro';

    const values: Record<string, string> = {
      title: variation.title, context: variation.context, customer: variation.customer,
      question: variation.question, clarification: variation.clarification, location: variation.location,
      quoteNumber: 'Presupuesto de ejemplo · ' + variation.quoteNumber,
      invoiceNumber: state.invoice ? 'Factura de ejemplo · ' + variation.invoiceNumber : 'Factura de ejemplo',
      amount: demoEuros(variation.price), paid: demoEuros(state.paid), remaining: demoEuros(remaining),
      'partial-amount': demoEuros(variation.firstPayment), 'progress-balance': state.invoice ? demoEuros(remaining) : 'Sin factura',
      person: state.assignment?.person ?? '', slot: state.assignment?.slot ?? '',
      'task-0': variation.tasks[0], 'task-1': variation.tasks[1], note: variation.note,
      'status-presupuesto': quoteStatus[state.quote],
      'status-agenda': state.closed ? 'Realizada' : assigned ? 'Asignada' : 'Sin asignar',
      'status-parte': workStatus, 'status-factura': invoiceStatus,
    };
    const visible: Record<string, boolean> = {
      question: state.asked, 'quote-open': !accepted,
      'needs-quote': !accepted, 'can-assign': accepted && !assigned, assigned,
      'needs-visit': !assigned, 'has-visit': assigned, 'part-open': !state.closed,
      'part-closed': state.closed, 'needs-part': !state.closed,
      'can-invoice': state.closed && !state.invoice, 'has-invoice': state.invoice,
      unpaid: remaining > 0,
    };
    for (const [key, elements] of bind) {
      for (const element of elements) element.textContent = values[key] ?? '';
    }
    for (const element of visibility) element.hidden = !visible[element.dataset.demoIf ?? ''];
    for (const radio of radios) radio.checked = radio.value === variation.id;
    for (const [i, check] of checks.entries()) {
      check.checked = state.checks.has(i);
      check.disabled = !assigned || state.closed;
    }
    for (const button of actions) {
      switch (button.dataset.demoAction) {
        case 'question': button.disabled = state.asked; break;
        case 'save-part': button.disabled = !state.checks.size || state.saved; break;
        case 'close-part': button.disabled = !state.saved || state.checks.size !== checks.length; break;
        case 'partial': button.hidden = state.paid > 0; break;
      }
    }
    for (const button of nextButtons) {
      button.disabled = ![accepted, assigned, state.closed][Number(button.dataset.demoNext) - 1];
    }
    for (const [i, tab] of tabs.entries()) {
      tab.tabIndex = i === stage ? 0 : -1;
      tab.setAttribute('aria-selected', String(i === stage));
    }
    for (const [i, panel] of panels.entries()) panel.hidden = i !== stage;
  }

  function activate(index: number, focus: boolean) {
    if (!tabs[index]) return;
    stage = index;
    render();
    if (focus) tabs[index].focus();
  }

  function reset(next: DemoCase) {
    variation = next;
    stage = 0;
    state = fresh();
    chooseOptions();
    render();
  }

  interactive.addEventListener('click', (event) => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>('button');
    if (!button || button.disabled) return;
    if (button.dataset.demoTab !== undefined) {
      activate(Number(button.dataset.demoTab), false);
      return;
    }
    if (button.dataset.demoNext !== undefined) {
      activate(Number(button.dataset.demoNext), true);
      return;
    }

    let message = '';
    let nextFocus: HTMLElement | undefined;
    const action = button.dataset.demoAction;
    if (action === 'reset') {
      reset(variation);
      say('Ejemplo reiniciado: ' + variation.name + '.');
      return;
    }
    switch (action) {
      case 'question':
        if (state.quote !== 'pending') return;
        state.asked = true;
        state.quote = 'question';
        message = 'Se muestra la aclaración del ejemplo. No se ha enviado ningún mensaje.';
        nextFocus = actions.find((item) => item.dataset.demoAction === 'accept');
        break;
      case 'accept':
        if (state.quote === 'accepted') return;
        state.quote = 'accepted';
        message = 'Presupuesto de ejemplo aceptado. Ya puedes asignar la visita.';
        nextFocus = nextButtons[0];
        break;
      case 'assign':
        if (state.quote !== 'accepted' || state.assignment || !person.value || !slot.value) return;
        state.assignment = { person: person.value, slot: slot.value };
        message = 'Visita de ejemplo asignada a ' + state.assignment.person + '.';
        nextFocus = nextButtons[1];
        break;
      case 'unassign':
        state = { ...fresh(), quote: state.quote, asked: state.asked };
        message = 'Se ha borrado la asignación y se han reiniciado el parte y los cobros de ejemplo.';
        nextFocus = person;
        break;
      case 'save-part':
        if (!state.assignment || !state.checks.size || state.closed) return;
        state.saved = true;
        message = 'Borrador de ejemplo guardado en esta pantalla.';
        nextFocus = state.checks.size === checks.length ?
          actions.find((item) => item.dataset.demoAction === 'close-part') : checks.find((item) => !item.checked);
        break;
      case 'close-part':
        if (!state.saved || state.checks.size !== checks.length) return;
        state.closed = true;
        message = 'El parte del ejemplo está cerrado. Ya puedes preparar la factura de ejemplo.';
        nextFocus = nextButtons[2];
        break;
      case 'create-invoice':
        if (!state.closed || state.invoice) return;
        state.invoice = true;
        message = 'Factura de ejemplo preparada. Saldo pendiente: ' + demoEuros(variation.price) + '.';
        nextFocus = actions.find((item) => item.dataset.demoAction === 'partial');
        break;
      case 'partial':
        if (!state.invoice || state.paid !== 0) return;
        state.paid = variation.firstPayment;
        message = 'Cobro parcial ficticio registrado. Quedan ' + demoEuros(variation.price - state.paid) + '.';
        nextFocus = actions.find((item) => item.dataset.demoAction === 'full');
        break;
      case 'full':
        if (!state.invoice || state.paid >= variation.price) return;
        state.paid = variation.price;
        message = 'Factura de ejemplo cobrada. No se ha movido dinero.';
        nextFocus = panels[stage];
        break;
      default: return;
    }
    const restore = document.activeElement === button;
    render();
    say(message);
    if (restore) nextFocus?.focus();
  });

  interactive.addEventListener('change', (event) => {
    if (!(event.target instanceof HTMLInputElement)) return;
    if (event.target.name === 'recorrido-case') {
      const next = demoCases.find(({ id }) => id === (event.target as HTMLInputElement).value);
      if (next && next !== variation) {
        reset(next);
        say('Ejemplo de ' + next.name.toLowerCase() + ' listo.');
      }
      return;
    }
    if (event.target.dataset.recorridoComprobacion === undefined || !state.assignment || state.closed) return;
    const index = Number(event.target.dataset.recorridoComprobacion);
    if (event.target.checked) state.checks.add(index);
    else state.checks.delete(index);
    state.saved = false;
    render();
  });

  for (const [i, tab] of tabs.entries()) {
    tab.addEventListener('keydown', (event) => {
      const position = ({
        ArrowRight: (i + 1) % tabs.length, ArrowLeft: (i - 1 + tabs.length) % tabs.length,
        Home: 0, End: tabs.length - 1,
      } as Record<string, number>)[event.key];
      if (position === undefined) return;
      event.preventDefault();
      activate(position, true);
    });
  }

  reset(variation);
  interactive.hidden = false;
  fallback.open = false;
}
