const axios = require('axios');
const { randomUUID } = require('crypto');

module.exports = async (req, res) => {
  try {
    const response = await axios.post('https://www.blackbox.ai/api/chat', {
      messages: [{ role: 'user', content: 'Apa kabar sayang', id: randomUUID() }],
      agentMode: {},
      id: randomUUID(),
      previewToken: null,
      userId: null,
      codeModelMode: true,
      trendingAgentMode: {},
      isMicMode: false,
      userSystemPrompt: null,
      maxTokens: 1024,
      playgroundTopP: null,
      playgroundTemperature: null,
      isChromeExt: false,
      githubToken: '',
      clickedAnswer2: false,
      clickedAnswer3: false,
      clickedForceWebSearch: false,
      visitFromDelta: false,
      isMemoryEnabled: false,
      mobileClient: false,
      userSelectedModel: null,
      validated: randomUUID(),
      imageGenerationMode: false,
      webSearchModePrompt: false,
      deepSearchMode: false,
      domains: null,
      vscodeClient: false,
      codeInterpreterMode: false,
      customProfile: {
        name: '',
        occupation: '',
        traits: [],
        additionalInfo: '',
        enableNewChats: false
      },
      session: {
        user: {
          name: 'Riki PurPur',
          email: 'rikipurpur98@gmail.com',
          image: 'https://lh3.googleusercontent.com/a/ACg8ocKHaWelcSDldvbm6wh0CegljUr_Iyv8NYNFVlaCb0qk_LrecA4=s96-c',
          id: '105532451547066425912'
        },
        expires: '2025-04-26T06:49:57.550Z'
      },
      isPremium: false,
      subscriptionCache: {
        status: 'FREE',
        expiryTimestamp: null,
        lastChecked: Date.now(),
        isTrialSubscription: false
      },
      beastMode: false,
      reasoningMode: false
    }, {
      headers: {
        'Host': 'www.blackbox.ai',
        'content-type': 'application/json',
        'sec-ch-ua-platform': '"Android"',
        'user-agent': 'Mozilla/5.0 (Linux; Android 10; RMX2185 Build/QP1A.190711.020) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.6998.40 Mobile Safari/537.36',
        'sec-ch-ua': '"Chromium";v="134", "Not:A-Brand";v="24", "Android WebView";v="134"',
        'sec-ch-ua-mobile': '?1',
        'accept': '*/*',
        'origin': 'https://www.blackbox.ai',
        'x-requested-with': 'mark.via.gp',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'referer': 'https://www.blackbox.ai/',
        'accept-encoding': 'gzip, deflate, br, zstd',
        'accept-language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'cookie': 'sessionId=b113c0a6-8237-47d4-b0a1-98aa57ded2bf; __Host-authjs.csrf-token=bb484c7c6ae3ab84d3a2b643d70546bec645bc8b3ae2e6b63c5b9ce0ecc40a94%7Ce26e5e3b7ce0b13917bb68ceed5a2c14345ea56e6ce717d94be0391e41a7bd86; intercom-id-x55eda6t=071a2afb-432e-44f9-8cbe-8de6696ea392; intercom-device-id-x55eda6t=6d63c75e-7dfa-4fd7-bb5c-4ad9b044b2b9; __Secure-authjs.callback-url=https%3A%2F%2Fwww.blackbox.ai%2F; render_app_version_affinity=dep-cvibjql6ubrc73cqc0m0; __Secure-authjs.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..YZedwOnK5SsO1vyG.2aeexEBfksLL4XODHqETZ5DcdrtE6S8QIgbSX9gO5TTmJKxOKR-G7gSpcstcyRnOXse0Dv2r7M4qdf-gQsAWyRgVDno5KGlz19UxFj-4dAFoeivWW4kO7_yCEhJEBPeEPBMBSh90GTz4cSNDRtdaysk2dTD_1DpvkvZxL-fy6FcQNAF8ZBK8Kkmc45tPwEpgrci0r7QASzNoFaTtPXsfXSzdEpYmOpRzvXisNGtJ2zEy3IPxsLaDQmmUMuwSMLKaSQP5_Adf0RBSPsoPoTiInH4NnD_p78DkvDFl3qDkcu3-BuPIHqmItum-a3ipDFucLVvlYBkvOLnVHVo0j9_iCo7pPK3PPp_j3pzvHhRFFeB-w0YDZze1G93SVKLpebcom5_DE6x4I2dkB30ikku-t_zvtbBPhPrzrAUBBzMeM0QWjAXPJR-ofIu_xYbD8A3vKovZzNRy43jKzNjzOkM3xTTkhxkXtO-tYgheTe8szQ7QHodid9ws-8r3fj_n7dLd_D8SQWL3qGSeXo-zMDw3iXRTRZDEDWEd8LAq.X6HeGJ_KZ87ESDKliJRGGw; intercom-session-x55eda6t=bkRhOFFlaFpWblBkM2pTVVFkR3c2MzNuZkdYR01wa2NZT05LYkNoS3ZIczIreVdpaVo2SityVVJpSEEwRkducFdva1BDdjkxdXJJRFZDTW40WnRGa2ppV0VrNDZDdTM2U1VuZ0daWUlaVkE9LS1XQStoV1dFWmc3UnJPcHVMd0EzbTBnPT0=--b522a8e2c0e13236f22f711152d5bee9fa1434cc'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json({ error: error.message });
  }
};