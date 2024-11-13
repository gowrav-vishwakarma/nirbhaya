import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import {
  faHeart as fasHeart,
  faHeartCircleCheck,
  faShareNodes,
  faGlobeAmericas,
  faEllipsisH,
  faVideo,
} from '@fortawesome/free-solid-svg-icons';
import {
  faHeart as farHeart,
  faCommentDots,
  faImage,
  faBookmark,
  faFlag,
  faCalendarAlt,
  faClock,
} from '@fortawesome/free-regular-svg-icons';

// Add icons to the library
library.add(
  fasHeart,
  farHeart,
  faHeartCircleCheck,
  faCommentDots,
  faShareNodes,
  faGlobeAmericas,
  faImage,
  faVideo,
  faBookmark,
  faFlag,
  faCalendarAlt,
  faClock,
  faEllipsisH
);

export { FontAwesomeIcon };
