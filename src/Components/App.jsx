/* @flow */
import React from "react";
import { connect } from "react-redux";
import { t } from "i18next";
import Radium from "radium";
import UUID from "uuid-js";
import { ThemeProvider, createTheme } from "@material-ui/core/styles";
import withWidth from "@material-ui/core/withWidth";
import IconButton from "@material-ui/core/IconButton";
import Badge from "@material-ui/core/Badge";
import MenuIcon from "@material-ui/icons/Menu";
import CloseIcon from "@material-ui/icons/Close";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Drawer from "@material-ui/core/Drawer";
import Menu from "./Menu";
import RightMenu from "./RightMenu";
import { addAnimation } from "../Actions/animations";
import purple from "@material-ui/core/colors/purple";
import green from "@material-ui/core/colors/green";

// Create a custom theme using createTheme
const customTheme = createTheme({
  palette: {
    primary: { main: "#99c430", contrastText: "#fff" },
    secondary: { main: "#eb6308" },
  },
  typography: {
    // Global font family
    fontFamily: '"Jura", "Roboto", "Helvetica", "Arial", sans-serif',
    // Default font weights
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    // Optionally, you can override specific typography variants:
    h6: {
      fontFamily: '"Jura", "Roboto", "Helvetica", "Arial", sans-serif',
      fontWeight: 900,
      textTransform: "uppercase",
    },
  },
});

const styles = {
  root: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    overflow: "auto",
    position: "relative",
    width: "100%",
  },
  content: {
    display: "flex",
    flex: "1 1 0",
    flexGrow: 1,
    transition: "margin 0.3s",
  },
  contentShift: {
    marginLeft: 230,
  },
  menuButton: {
    marginRight: 16,
    display: "inline-flex",
  },
  toolbar: {
    paddingLeft: 10,
  },
};

type Props = {
  width: number,
};

type State = {
  drawerOpen: boolean,
};

@Radium
class Webedit extends React.Component<Props, State> {
  state = {
    drawerOpen: !/Android|webOS|iPhone|iPad|iPod|Opera Mini/i.test(
      navigator.userAgent
    ),
  };

  componentDidMount() {
    const encodedAnimation = this.props.location.query.s;
    if (encodedAnimation) {
      const decodedAnimation = JSON.parse(
        atob(decodeURIComponent(encodedAnimation))
      );
      decodedAnimation.id = UUID.create().toString();
      this.props.addAnimation(decodedAnimation);
      this.props.router.push(`${BASE_URL}/${decodedAnimation.id}`);
    }
  }

  toggleDrawer = () => {
    this.setState((prevState) => ({
      drawerOpen: !prevState.drawerOpen,
    }));
  };

  render() {
    const { activeView, currentAnimationId } = this.props;
    const { drawerOpen } = this.state;
    const contentStyle = drawerOpen
      ? { ...styles.content, ...styles.contentShift }
      : styles.content;

    return (
      <ThemeProvider theme={customTheme}>
        <div style={styles.root}>
          <AppBar position="static">
            <Toolbar style={styles.toolbar}>
              <IconButton
                color="inherit"
                onClick={this.toggleDrawer}
                style={styles.menuButton}
              >
                <Badge
                  overlap="rectangular"
                  badgeContent={this.props.animations.size}
                  color="secondary"
                >
                  <MenuIcon />
                </Badge>
              </IconButton>
              {/* {this.props.width > 1 && ( */}
              <Typography variant="h6" color="inherit" style={{ flexGrow: 1 }}>
                {t("headerTitle")}
              </Typography>
              {/* )} */}
              <div style={{ marginLeft: "auto" }}>
                <RightMenu currentAnimationId={currentAnimationId} />
              </div>
            </Toolbar>
          </AppBar>

          <Drawer variant="persistent" open={drawerOpen}>
            <div
              tabIndex={0}
              role="button"
              onClick={this.toggleDrawer}
              onKeyDown={this.toggleDrawer}
            >
              <AppBar position="static">
                <Toolbar style={styles.toolbar}>
                  <IconButton color="inherit" style={styles.menuButton}>
                    <CloseIcon />
                  </IconButton>
                  <Typography variant="h6" color="inherit">
                    {t("headerTitle")}
                  </Typography>
                </Toolbar>
              </AppBar>
              <Menu
                active={activeView}
                currentAnimationId={currentAnimationId}
                navigate={(path) =>
                  this.props.router.push(`${BASE_URL}${path}`)
                }
              />
            </div>
          </Drawer>
          <main style={contentStyle}>{this.props.children}</main>
        </div>
      </ThemeProvider>
    );
  }
}

export default connect((state) => ({ animations: state.animations }), {
  addAnimation,
})(withWidth()(Webedit));
