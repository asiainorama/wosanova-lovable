import { Navigation, Pagination, Virtual, Mousewheel } from 'swiper/modules';

export interface SwiperConfig {
  modules: any[];
  mousewheel: {
    forceToAxis: boolean;
    sensitivity: number;
    thresholdDelta: number;
    thresholdTime: number;
  };
  speed: number;
  cssMode: boolean;
  resistanceRatio: number;
  threshold: number;
  followFinger: boolean;
  touchRatio: number;
  watchSlidesProgress: boolean;
  grabCursor: boolean;
  virtual: {
    addSlidesAfter: number;
    addSlidesBefore: number;
  };
  className: string;
  wrapperClass: string;
}

export class SwiperConfigService {
  static getDefaultConfig(): SwiperConfig {
    return {
      modules: [Navigation, Pagination, Virtual, Mousewheel],
      mousewheel: {
        forceToAxis: true,
        sensitivity: 1.2,
        thresholdDelta: 50,
        thresholdTime: 150,
      },
      speed: 300,
      cssMode: false,
      resistanceRatio: 0.85,
      threshold: 20,
      followFinger: true,
      touchRatio: 1,
      watchSlidesProgress: true,
      grabCursor: true,
      virtual: {
        addSlidesAfter: 1,
        addSlidesBefore: 1,
      },
      className: "h-full app-swiper",
      wrapperClass: "h-full"
    };
  }
}