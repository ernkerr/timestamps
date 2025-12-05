#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(VideoExport, NSObject)

RCT_EXTERN_METHOD(exportVideo:(NSDictionary *)options
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getVideoMetadata:(NSString *)sourceUri
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

@end
