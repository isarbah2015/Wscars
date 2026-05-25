import * as React from "react";
import {
  ActivityIndicator,
  Button,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ApplicationVerifier } from "firebase/auth";
import type { FirebaseWebConfig } from "@/lib/firebase-config";
import FirebaseRecaptcha from "./FirebaseRecaptcha";

type Props = {
  firebaseConfig: FirebaseWebConfig;
  title?: string;
  cancelLabel?: string;
  attemptInvisibleVerification?: boolean;
};

type State = {
  visible: boolean;
  visibleLoaded: boolean;
  invisibleLoaded: boolean;
  invisibleVerify: boolean;
  invisibleKey: number;
  resolve?: (token: string) => void;
  reject?: (error: Error) => void;
};

export default class FirebaseRecaptchaVerifierModal
  extends React.Component<Props, State>
  implements ApplicationVerifier
{
  static defaultProps = {
    title: "reCAPTCHA",
    cancelLabel: "Cancel",
  };

  state: State = {
    visible: false,
    visibleLoaded: false,
    invisibleLoaded: false,
    invisibleVerify: false,
    invisibleKey: 1,
    resolve: undefined,
    reject: undefined,
  };

  static getDerivedStateFromProps(props: Props, state: State) {
    if (!props.attemptInvisibleVerification && state.invisibleLoaded) {
      return { invisibleLoaded: false, invisibleVerify: false };
    }
    return null;
  }

  get type(): string {
    return "recaptcha";
  }

  async verify(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (this.props.attemptInvisibleVerification) {
        this.setState({ invisibleVerify: true, resolve, reject });
      } else {
        this.setState({ visible: true, visibleLoaded: false, resolve, reject });
      }
    });
  }

  /** Required by Firebase Auth after phone verification; noop for custom verifier. */
  _reset(): void {}

  private onVisibleLoad = () => {
    this.setState({ visibleLoaded: true });
  };

  private onInvisibleLoad = () => {
    this.setState({ invisibleLoaded: true });
  };

  private onFullChallenge = () => {
    this.setState({ invisibleVerify: false, visible: true });
  };

  private onError = () => {
    const { reject } = this.state;
    reject?.(new Error("Failed to load reCAPTCHA"));
    this.setState({ visible: false, invisibleVerify: false });
  };

  private onVerify = (token: string) => {
    const { resolve } = this.state;
    resolve?.(token);
    this.setState((state) => ({
      visible: false,
      invisibleVerify: false,
      invisibleLoaded: false,
      invisibleKey: state.invisibleKey + 1,
    }));
  };

  cancel = () => {
    const { reject } = this.state;
    reject?.(new Error("Cancelled by user"));
    this.setState({ visible: false });
  };

  render() {
    const { title, cancelLabel, attemptInvisibleVerification, firebaseConfig } = this.props;
    const { visible, visibleLoaded, invisibleLoaded, invisibleVerify, invisibleKey } = this.state;

    return (
      <View style={styles.container}>
        {attemptInvisibleVerification ? (
          <FirebaseRecaptcha
            key={`invisible${invisibleKey}`}
            firebaseConfig={firebaseConfig}
            style={styles.invisible}
            onLoad={this.onInvisibleLoad}
            onError={this.onError}
            onVerify={this.onVerify}
            onFullChallenge={this.onFullChallenge}
            invisible
            verify={invisibleLoaded && invisibleVerify}
          />
        ) : null}
        <Modal
          visible={visible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={this.cancel}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <View style={styles.cancel}>
                <Button title={cancelLabel ?? FirebaseRecaptchaVerifierModal.defaultProps.cancelLabel} onPress={this.cancel} />
              </View>
            </View>
            <View style={styles.content}>
              <FirebaseRecaptcha
                firebaseConfig={firebaseConfig}
                style={styles.content}
                onLoad={this.onVisibleLoad}
                onError={this.onError}
                onVerify={this.onVerify}
              />
              {!visibleLoaded ? (
                <View style={styles.loader}>
                  <ActivityIndicator size="large" />
                </View>
              ) : null}
            </View>
          </SafeAreaView>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: { width: 0, height: 0 },
  invisible: { width: 300, height: 300 },
  modalContainer: { flex: 1 },
  header: {
    backgroundColor: "#FBFBFB",
    height: 44,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: "#CECECE",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  cancel: { position: "absolute", left: 8, justifyContent: "center" },
  title: { fontWeight: "bold" },
  content: { flex: 1 },
  loader: {
    ...StyleSheet.absoluteFillObject,
    paddingTop: 20,
    justifyContent: "flex-start",
    alignItems: "center",
  },
});
