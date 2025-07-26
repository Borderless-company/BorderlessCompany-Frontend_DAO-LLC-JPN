import { useState, useEffect } from "react";

interface InAppBrowserInfo {
  isInAppBrowser: boolean;
  browserType: string | null;
  canOpenExternal: boolean;
}

export const useInAppBrowser = (): InAppBrowserInfo => {
  const [browserInfo, setBrowserInfo] = useState<InAppBrowserInfo>({
    isInAppBrowser: false,
    browserType: null,
    canOpenExternal: false,
  });

  useEffect(() => {
    const detectInAppBrowser = () => {
      const userAgent = navigator.userAgent;
      let isInAppBrowser = false;
      let browserType: string | null = null;
      let canOpenExternal = false;

      // LINE
      if (/Line/i.test(userAgent)) {
        isInAppBrowser = true;
        browserType = "LINE";
        canOpenExternal = true;
      }
      // Facebook
      else if (/FB/i.test(userAgent)) {
        isInAppBrowser = true;
        browserType = "Facebook";
        canOpenExternal = true;
      }
      // Instagram
      else if (/Instagram/i.test(userAgent)) {
        isInAppBrowser = true;
        browserType = "Instagram";
        canOpenExternal = true;
      }

      setBrowserInfo({
        isInAppBrowser,
        browserType,
        canOpenExternal,
      });
    };

    detectInAppBrowser();
  }, []);

  return browserInfo;
};
