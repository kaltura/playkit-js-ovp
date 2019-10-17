import {
    APIResponse,
    ClientApi,
    isAPIErrorResponse,
    RegisterRequestParams,
    RegisterRequestResponse
} from "./client-api";
import { SocketWrapper } from "./socket-wrapper";
import { getContribLogger, PlayerContribRegistry } from "@playkit-js-contrib/common";

export interface EventParams extends Record<string, any> {
    entryId: string;
    userId?: string;
}

export interface PrepareRegisterRequestConfig {
    eventName: string;
    eventParams?: EventParams;
    onMessage: Function;
}

export interface RegisterNotificationsParams {
    prepareRegisterRequestConfigs: PrepareRegisterRequestConfig[];
    onSocketDisconnect?: Function;
    onSocketReconnect?: Function;
}

export interface PushNotificationsOptions {
    ks: string;
    serviceUrl: string;
    clientTag: string;
    corePlayer: CorePlayer;
}

export interface APINotificationResponse extends APIResponse {
    url: string;
    queueName: string;
    queueKey: string;
}

export function isAPINotificationResponse(
    response: APIResponse
): response is APINotificationResponse {
    return response.objectType === "KalturaPushNotificationData";
}

const logger = getContribLogger({
    module: "contrib-push-notifications",
    class: "PushNotifications"
});

const ResourceToken = "PushNotifications-v1";

function getDomainFromUrl(url: string) {
    return url.replace(/^(.*\/\/[^\/?#]*).*$/, "$1");
}

export class PushNotificationsFactory {
    static fromPlayer(
        playerContribRegistry: PlayerContribRegistry,
        creator: () => PushNotificationsFactory
    ) {
        return playerContribRegistry.register(ResourceToken, 1, creator);
    }

    private instancePool: any = {};

    getInstance(options: PushNotificationsOptions): PushNotifications {
        const domainUrl = getDomainFromUrl(options.serviceUrl);

        if (!this.instancePool[domainUrl]) {
            const newInstance = new PushNotifications(options);
            this.instancePool[domainUrl] = newInstance;
        }

        return this.instancePool[domainUrl];
    }
}
export class PushNotifications {
    private _socketPool: any = {};
    private _clientApi: any;

    constructor(options: PushNotificationsOptions) {
        this._clientApi = new ClientApi(options);
        this._onPlayerReset(options);
    }

    private _onPlayerReset(options: PushNotificationsOptions) {
        options.corePlayer.addEventListener(options.corePlayer.Event.PLAYER_RESET, () => {
            this.reset();
        });
    }

    public reset() {
        for (let socketKey in this._socketPool) {
            this._socketPool[socketKey].destroy();
        }

        this._socketPool = {};
    }

    public registerNotifications(
        registerNotifications: RegisterNotificationsParams
    ): Promise<void> {
        let apiRequests: RegisterRequestParams[] = registerNotifications.prepareRegisterRequestConfigs.map(
            (eventConfig: PrepareRegisterRequestConfig) => {
                return this._prepareRegisterRequest(eventConfig);
            }
        );

        return this._clientApi
            .doMultiRegisterRequest(apiRequests)
            .then((results: RegisterRequestResponse[]) => {
                let promiseArray = results.map((result, index) => {
                    return this._processResult(
                        registerNotifications.prepareRegisterRequestConfigs[index],
                        result,
                        registerNotifications.onSocketDisconnect,
                        registerNotifications.onSocketReconnect
                    );
                });

                return Promise.all(promiseArray).then(() => {
                    return;
                });
            });
    }

    private _prepareRegisterRequest(
        prepareRegisterRequestConfig: PrepareRegisterRequestConfig
    ): RegisterRequestParams {
        let request: RegisterRequestParams = {
            service: "eventnotification_eventnotificationtemplate",
            action: "register",
            notificationTemplateSystemName: prepareRegisterRequestConfig.eventName,
            pushNotificationParams: {
                objectType: "KalturaPushNotificationParams",
                userParams: {}
            }
        };

        let index = 0;
        for (let paramsKey in prepareRegisterRequestConfig.eventParams) {
            request.pushNotificationParams.userParams[`item${index}`] = {
                objectType: "KalturaPushNotificationParams",
                key: paramsKey,
                value: {
                    objectType: "KalturaStringValue",
                    value: prepareRegisterRequestConfig.eventParams[paramsKey]
                },
                sQueueKeyParam: 1
            };
            index++;
        }

        return request;
    }

    private _processResult(
        registerRequest: PrepareRegisterRequestConfig,
        result: RegisterRequestResponse,
        onSocketDisconnect?: Function,
        onSocketReconnect?: Function
    ): Promise<void> {
        if (isAPIErrorResponse(result)) {
            logger.error(
                `Error fetching registration info from service ${registerRequest.eventName}`,
                {
                    method: `_processResult`,
                    data: {
                        errorMessage: result.message,
                        errorCode: result.code
                    }
                }
            );
            return Promise.reject(new Error(result.message));
        }

        if (!isAPINotificationResponse(result)) {
            return Promise.reject(new Error("invalid response structure"));
        }

        //cache sockets by host name
        let socketKey = getDomainFromUrl(result.url);
        let socketWrapper = this._socketPool[socketKey];
        if (!socketWrapper) {
            socketWrapper = new SocketWrapper({
                key: socketKey,
                url: result.url,
                onSocketDisconnect,
                onSocketReconnect
            });
            this._socketPool[socketKey] = socketWrapper;
        }

        socketWrapper.prepareForListening(
            registerRequest.eventName,
            result.queueName,
            result.queueKey,
            registerRequest.onMessage
        );

        return Promise.resolve();
    }
}
