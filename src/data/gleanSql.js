export const getGleanQuerySTMOTemplateUrl = (columnName, table) =>
  `https://sql.telemetry.mozilla.org/queries/110672/source?p_columnName=${columnName}&p_table=${table}`;

export const getGleanLabeledCounterQuerySTMOTemplateUrl = (columnName, table) =>
  `https://sql.telemetry.mozilla.org/queries/110677/source?p_columnName=${columnName}&p_table=${table}`;

export const getGleanDualLabeledCounterQuerySTMOTemplateUrl = (
  columnName,
  table
) =>
  `https://sql.telemetry.mozilla.org/queries/110678/source?p_columnName=${columnName}&p_table=${table}`;

export const getGleanLegacyEventQuerySTMOTemplateUrl = (table, additionalInfo) =>
  `https://sql.telemetry.mozilla.org/queries/110679/source?p_table=${table}&p_eventCategory=${additionalInfo.category}&p_eventName=${additionalInfo.name}`;

export const getGleanEventQuerySTMOTemplateUrl = (table, additionalInfo) =>
  `https://sql.telemetry.mozilla.org/queries/110680/source?p_table=${table}&p_eventCategory=${additionalInfo.category}&p_eventName=${additionalInfo.name}`;

export const getGleanAutoEventQuerySTMOTemplateUrl = (table, additionalInfo) =>
  `https://sql.telemetry.mozilla.org/queries/110681/source?p_table=${table}&p_eventCategory=${additionalInfo.category}&p_eventName=${additionalInfo.name}&p_autoEventId=${additionalInfo.auto_event_id}`;

export const getGleanPingQuerySTMOTemplateUrl = (table) =>
  `https://sql.telemetry.mozilla.org/queries/110682/source?p_table=${table}`;
