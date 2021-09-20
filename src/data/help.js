export function getExpiredItemDescription(itemType) {
  return `This ${itemType} has expired: new data will not be collected by the application.`;
}

export function getRemovedItemDescription(itemType) {
  return `This ${itemType} is no longer defined in the source code: new data will not be collected by the application.`;
}

export function getDeprecatedItemDescription(itemType) {
  return `This ${itemType} is considered deprecated: data may still be collected but it has been superseded by something else.`;
}

export function getLibraryDescription(itemType, origin) {
  return `This ${itemType} is defined in the ${origin} library, not the application.`;
}

export function getRecentlyAddedItemDescription(numberOfChannels, itemType) {
  return numberOfChannels > 1
    ? `This ${itemType} was recently added. It may take some time before it is available on all channels.`
    : `This ${itemType} was recently added. Data may not be available until a new version is released with this ${itemType} and clients are updated to it.`;
}
