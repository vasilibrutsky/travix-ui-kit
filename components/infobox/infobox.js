import React, { PropTypes } from 'react';

import { getClassNamesWithMods, getDataAttributes } from '../_helpers';

function InfoBox({ dataAttr, type, mods }) {
  type && mods.push(type);
  const className = getClassNamesWithMods('ui-infobox', mods);
  const restProps = getDataAttributes(dataAttr);

  return (
    <div className={className}>
      blaaaaa!!!
    </div>
  );
}

InfoBox.defaultProps = {
  type: 'info',
};

InfoBox.PropTypes = {
  /**
   * Defines the content of the InfoBox
   */
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
    PropTypes.node,
  ]),

  /**
   * Data attribute. You can use to pass custom attributes to the component
   */
  dataAttr: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.object,
  ]),

  /**
   * Defines the type of the message
   */
  type: PropTypes.string,
};

export default InfoBox;
