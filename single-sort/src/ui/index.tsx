import React from 'react';
import { render } from '@boardzilla/core';
import { default as setup } from '../game/index.js';

import './style.scss';

render(setup, {
  settings: {
  },
  layout: game => {
  }
});
