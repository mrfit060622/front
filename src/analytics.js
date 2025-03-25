import ReactGA from "react-ga4";

const TRACKING_ID = "G-WGKRFBMS41"; 
ReactGA.initialize(TRACKING_ID);

export const trackPageView = () => {
  ReactGA.send("pageview");
};

export const trackEvent = (category, action, label = "") => {
  ReactGA.event({
    category,
    action,
    label,
  });
};
