export const googleAnalytics = (gaID) => {
  // detecting "do not track" via these instructions:
  // https://dev.to/corbindavenport/how-to-correctly-check-for-do-not-track-with-javascript-135d
  if (window.doNotTrack == "1" ||
      navigator.doNotTrack == "yes" || navigator.doNotTrack == "1" ||
      navigator.msDoNotTrack == "1" ||
      ('msTrackingProtectionEnabled' in window.external &&
       window.external.msTrackingProtectionEnabled())) {
    // do not track is enabled: do not load ga
    return;
  }
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

  ga('create', gaID, 'auto');
};
