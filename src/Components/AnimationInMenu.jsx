import React from "react";
import Radium from "radium";
import ListItem from "@material-ui/core/ListItem";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import IconButton from "@material-ui/core/IconButton";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
import AnimationPreview from "./AnimationPreview";

const style = {
  itemText: {
    textOverflow: "ellipsis",
    overflow: "hidden",
    whiteSpace: "nowrap"
  },
  avatarWrapper: {
    position: "absolute",
    top: "8px",
    left: "16px",
  },
  listItem: {
    position: "relative",
    padding: "20px 56px 20px 72px",
  },
  listItemSelected: {
    backgroundColor: "#e0e0e0",
    position: "relative",
    padding: "20px 56px 20px 72px",
  },
};

type Props = {
  animation: Animation,
  selected: boolean,
  onRemove: (string) => void,
  onClick?: () => void,
};

class AnimationInMenu extends React.Component<Props> {
  remove = (e: SyntheticMouseEvent<*>) => {
    const { animation } = this.props;
    this.props.onRemove(animation.id);
    e.stopPropagation();
  };

  render() {
    const { animation, selected } = this.props;
    const avatar = (
      <div style={style.avatarWrapper}>
        <AnimationPreview animation={animation} size="thumb" offColor="black" />
      </div>
    );
    const txt = (
      <div style={style.itemText}>
        {animation.name || animation.text || "\u00A0"}
      </div>
    );

    return (
      <ListItem
        onClick={this.props.onClick}
        style={selected ? style.listItemSelected : style.listItem}
      >
        {avatar}
        {txt}
        <ListItemSecondaryAction style={{ right: 0 }}>
          <IconButton onClick={this.remove}>
            <DeleteForeverIcon />
          </IconButton>
        </ListItemSecondaryAction>
      </ListItem>
    );
  }
}

export default Radium(AnimationInMenu);
