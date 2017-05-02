import EasyTransform from './EasyTransform';

document.addEventListener('DOMContentLoaded', function initializeEZT() {
  EasyTransform.run();
  document.removeEventListener('DOMContentLoaded', initializeEZT);
});

export default EasyTransform;
