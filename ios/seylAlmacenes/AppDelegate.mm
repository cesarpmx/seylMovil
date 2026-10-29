#import "AppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <RCTRootViewFactory.h>

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"seylAlmacenes";
  // You can add your custom initial props in the dictionary below.
  // They will be passed down to the ViewController used by React Native.
  self.initialProps = @{};

  // iOS 27 exige el ciclo de vida UIScene: la ventana la crea SceneDelegate
  self.automaticallyLoadReactNativeWindow = NO;

  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
  return [self bundleURL];
}

- (NSURL *)bundleURL
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end

@interface SceneDelegate : UIResponder <UIWindowSceneDelegate>

@property (nonatomic, strong) UIWindow *window;

@end

@implementation SceneDelegate

- (void)scene:(UIScene *)scene
    willConnectToSession:(UISceneSession *)session
                 options:(UISceneConnectionOptions *)connectionOptions
{
  if (![scene isKindOfClass:[UIWindowScene class]]) {
    return;
  }

  AppDelegate *appDelegate = (AppDelegate *)[UIApplication sharedApplication].delegate;
  UIView *rootView = [appDelegate.rootViewFactory viewWithModuleName:appDelegate.moduleName
                                                   initialProperties:appDelegate.initialProps
                                                       launchOptions:nil];

  UIViewController *rootViewController = [appDelegate createRootViewController];
  [appDelegate setRootView:rootView toRootViewController:rootViewController];

  self.window = [[UIWindow alloc] initWithWindowScene:(UIWindowScene *)scene];
  self.window.rootViewController = rootViewController;
  // Algunas librerías leen la ventana desde el AppDelegate
  appDelegate.window = self.window;
  [self.window makeKeyAndVisible];
}

@end
