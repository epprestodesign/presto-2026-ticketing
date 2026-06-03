/** PATTERNS / Dashboards → Grid + stat cards (composition) */
export default {
  title: 'Patterns/Dashboards',
  tags: ['autodocs'],
  parameters: { docs: { description: { component: `
## Overview
An overview screen: KPI stat cards in a responsive grid. Here, a **property
performance** dashboard for hosts/admins. Lead with the most important metrics.
` } } },
}
const stat = (label, value, icon, color, delta) => `
  <div class="col-12 col-sm-6 col-md-3">
    <q-card flat bordered><q-card-section class="row items-center no-wrap">
      <q-avatar :color="'${color}'" text-color="white" icon="${icon}" class="q-mr-md" />
      <div><div class="text-caption text-grey-7">${label}</div>
        <div class="text-h6">${value}</div>
        <div class="text-caption text-positive">${delta}</div></div>
    </q-card-section></q-card>
  </div>`
export const PropertyOverview = {
  name: 'Property Overview',
  render: () => ({ template: `
    <div style="max-width:900px">
      <div class="text-h6 q-mb-md">Today at The Grand Plaza</div>
      <div class="row q-col-gutter-md">
        ${stat('Occupancy','86%','hotel','primary','▲ 5%')}
        ${stat('Revenue (RevPAR)','$214','payments','positive','▲ 8%')}
        ${stat('Arrivals today','42','event_available','accent','—')}
        ${stat('Cancellations','3','event_busy','negative','▼ 2%')}
      </div>
    </div>` }),
}
