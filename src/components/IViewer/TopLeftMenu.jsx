import React, { Fragment } from 'react';
import { shape, func, string, number, arrayOf } from 'prop-types';
import { Button, Icon, Dropdown } from 'semantic-ui-react';

const TopLeftMenu = ({
  data: { id: dataId, quickJump, views },
  openDialog,
  openItem,
  curViewId,
  setView,
}) => (
  <Fragment>
    <div>
      <Button basic icon onClick={() => openDialog()}>
        <Icon name="folder open" />
      </Button>
      <Dropdown
        selection
        value={dataId}
        options={quickJump.map(({ id, title }) => ({
          text: title,
          value: id,
        }))}
        onChange={(_, { value }) => openItem(value)}
      />
    </div>
    {views && views.length > 1 ? (
      <div style={{ marginTop: 3 }}>
        <Dropdown
          selection
          value={curViewId}
          options={views.map(({ title }, id) => ({
            text: title,
            value: id,
          }))}
          onChange={(_, { value }) => setView(value)}
        />
      </div>
    ) : null}
  </Fragment>
);

TopLeftMenu.propTypes = {
  data: shape({
    id: string.isRequired,
    quickJump: arrayOf(
      shape({
        id: string.isRequired,
        title: string.isRequired,
      })
    ).isRequired,
    views: arrayOf(
      shape({
        title: string.isRequired,
        data: shape({}).isRequired,
      })
    ),
  }).isRequired,
  openDialog: func.isRequired,
  openItem: func.isRequired,
  curViewId: number.isRequired,
  setView: func.isRequired,
};

export default TopLeftMenu;
