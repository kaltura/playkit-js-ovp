import { Component, h } from "preact";
import { ContribLogger, getContribLogger } from "@playkit-js-contrib/common";
import { AnnouncementContent } from "../../announcementManager";
import * as styles from "./_announcement.scss";

export interface AnnouncementProps {
    content: AnnouncementContent;
}

export class Announcement extends Component<AnnouncementProps> {
    private _logger: ContribLogger = getContribLogger({
        module: "contrib-ui",
        class: "Announcement"
    });

    componentDidMount(): void {
        this._logger.info(`mount component`, {
            method: "componentDidMount"
        });
    }

    componentWillUnmount(): void {
        this._logger.info(`unmount component`, {
            method: "componentWillUnmount"
        });
    }

    render({ content }: AnnouncementProps) {
        const { text, title = "Announcement", icon = this._defaultIcon() } = content;

        this._logger.trace(`render component`, {
            method: "render"
        });

        return (
            <div className={styles.defaultAnnouncementRoot + " " + styles.announcementWrapper}>
                <div className={styles.iconContainer}>
                    <div className={styles.iconWrapper}>{icon}</div>
                </div>
                <div className={styles.announcementBody}>
                    <div className={styles.title}>{title}</div>
                    <div className={styles.text}>{text}</div>
                </div>
            </div>
        );
    }

    private _defaultIcon() {
        return <div className={styles.iconImage} />;
    }
}