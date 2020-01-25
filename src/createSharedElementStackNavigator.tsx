import * as React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import SharedElementRendererView from './SharedElementRendererView';
import SharedElementRendererData, {
  ISharedElementRendererData,
} from './SharedElementRendererData';
import createSharedElementScene from './createSharedElementScene';
import SharedElementRendererContext from './SharedElementRendererContext';
import { SharedElementRendererProxy } from './SharedElementRendererProxy';
import {
  createStackNavigator,
  CardAnimationContext,
} from 'react-navigation-stack';

function createSharedElementStackSceneNavigator(
  routeConfigs: any,
  navigatorConfig: any,
  rendererData: ISharedElementRendererData
) {
  console.log('createSharedElementStackSceneNavigator...');

  const wrappedRouteConfigs = {
    ...routeConfigs,
  };
  for (const key in routeConfigs) {
    let routeConfig = wrappedRouteConfigs[key];
    const component =
      typeof routeConfig === 'object' && routeConfig.screen
        ? routeConfig.screen
        : routeConfig;
    const wrappedComponent = createSharedElementScene(
      component,
      rendererData,
      CardAnimationContext
    );
    if (component === routeConfig) {
      wrappedRouteConfigs[key] = wrappedComponent;
    } else {
      wrappedRouteConfigs[key] = {
        ...routeConfig,
        screen: wrappedComponent,
      };
    }
  }

  return createStackNavigator(wrappedRouteConfigs, {
    ...navigatorConfig,
    defaultNavigationOptions: {
      onTransitionStart: (transitionProps: { closing: boolean }) => {
        rendererData.startTransition(transitionProps.closing);
        if (
          navigatorConfig &&
          navigatorConfig.defaultNavigationOptions &&
          navigatorConfig.defaultNavigationOptions.onTransitionStart
        ) {
          navigatorConfig.defaultNavigationOptions.onTransitionStart(
            transitionProps
          );
        }
      },
      onTransitionEnd: (transitionProps: { closing: boolean }) => {
        rendererData.endTransition(transitionProps.closing);
        if (
          navigatorConfig &&
          navigatorConfig.defaultNavigationOptions &&
          navigatorConfig.defaultNavigationOptions.onTransitionEnd
        ) {
          navigatorConfig.defaultNavigationOptions.onTransitionEnd(
            transitionProps
          );
        }
      },
    },
  });
}

function createSharedElementStackNavigator(
  RouteConfigs: any,
  NavigatorConfig: any
): React.ComponentType<any> {
  // Create a proxy which is later updated to link
  // to the renderer
  const rendererDataProxy = new SharedElementRendererProxy();

  //const rendererData = new SharedElementRendererData();
  const SharedElementNavigator = createSharedElementStackSceneNavigator(
    RouteConfigs,
    NavigatorConfig,
    rendererDataProxy
  );

  class SharedElementRenderer extends React.Component {
    private rendererData?: SharedElementRendererData;
    render() {
      return (
        <SharedElementRendererContext.Consumer>
          {rendererData => {
            // In case a renderer is already present higher up in the chain
            // then don't bother creating a renderer here, but use that one instead
            if (rendererData) {
              rendererDataProxy.source = rendererData;
              return <SharedElementNavigator {...this.props} />;

              // Create/use our own renderer here
            } else {
              this.rendererData =
                this.rendererData || new SharedElementRendererData();
              rendererDataProxy.source = this.rendererData;
              return (
                <SharedElementRendererContext.Provider
                  value={this.rendererData}
                >
                  <SharedElementNavigator {...this.props} />
                  <SharedElementRendererView rendererData={this.rendererData} />
                </SharedElementRendererContext.Provider>
              );
            }
          }}
        </SharedElementRendererContext.Consumer>
      );
    }
  }
  hoistNonReactStatics(SharedElementRenderer, SharedElementNavigator);
  return SharedElementRenderer;
}

export default createSharedElementStackNavigator;

/*    // react-navigation-stack-v1
    /*onTransitionStart: (transitionProps: any, prevTransitionProps: any) => {
      console.log(
        'onTransitionStart-v1: ',
        transitionProps,
        prevTransitionProps
      );
      const { index, position } = transitionProps;
      const prevIndex = prevTransitionProps.index;
      if (index === prevIndex) return;
      rendererData.startTransition(
        position.interpolate({
          inputRange: [index - 1, index],
          outputRange: index > prevIndex ? [0, 1] : [2, 1],
        }),
        getActiveRouteState(transitionProps.scene.route),
        getActiveRouteState(prevTransitionProps.scene.route)
      );
      if (navigatorConfig && navigatorConfig.onTransitionStart) {
        navigatorConfig.onTransitionStart(
          getActiveRouteState(transitionProps.scene.route),
          getActiveRouteState(prevTransitionProps.scene.route)
        );
      }
    },
    onTransitionEnd: (transitionProps: any, prevTransitionProps: any) => {
      console.log('onTransitionEnd-v1: ', transitionProps, prevTransitionProps);
      if (!transitionProps.scene) {
        return;
      }
      rendererData.endTransition(
        transitionProps.scene.route,
        prevTransitionProps.scene.route
      );
      if (navigatorConfig && navigatorConfig.onTransitionEnd) {
        navigatorConfig.onTransitionEnd(transitionProps, prevTransitionProps);
      }
    },*/
