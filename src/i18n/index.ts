import enUS from './en-US/common';
import enUSWebsite from './en-US/website';
import hiIN from './hi-IN/common';
import hiINWebsite from './hi-IN/website';
import guIN from './gu-IN/common';
import guINWebsite from './gu-IN/website';
import enUSCommunity from './en-US/community';
import hiINCommunity from './hi-IN/community';
import guINCommunity from './gu-IN/community';

export default {
  'en-US': { common: enUS, website: enUSWebsite, community: enUSCommunity },
  'hi-IN': { common: hiIN, website: hiINWebsite, community: hiINCommunity },
  'gu-IN': { common: guIN, website: guINWebsite, community: guINCommunity },
};
