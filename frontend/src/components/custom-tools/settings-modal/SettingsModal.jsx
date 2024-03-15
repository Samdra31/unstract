import { Col, Menu, Modal, Row, Typography } from "antd";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import {
  CodeOutlined,
  DiffOutlined,
  FileTextOutlined,
  MessageOutlined,
} from "@ant-design/icons";

import SpaceWrapper from "../../widgets/space-wrapper/SpaceWrapper";
import { getMenuItem } from "../../../helpers/GetStaticData";
import { ManageLlmProfiles } from "../manage-llm-profiles/ManageLlmProfiles";
import { useCustomToolStore } from "../../../store/custom-tool-store";
import { CustomSynonyms } from "../custom-synonyms/CustomSynonyms";
import { PreAndPostAmbleModal } from "../pre-and-post-amble-modal/PreAndPostAmbleModal";

import "./SettingsModal.css";

let SummarizeManager = null;
let EvaluationManager = null;
try {
  SummarizeManager =
    require("../../../plugins/summarize-manager/SummarizeManager").SummarizeManager;
  EvaluationManager =
    require("../../../plugins/evaluation-manager/EvaluationManager").EvaluationManager;
} catch {
  // Component will remain null if it is not present.
}
function SettingsModal({ open, setOpen, handleUpdateTool }) {
  const [selectedId, setSelectedId] = useState(1);
  const [llmItems, setLlmItems] = useState([]);
  const { llmProfiles } = useCustomToolStore();
  const [menuItems, setMenuItems] = useState([]);
  const [components, setComponents] = useState([]);

  useEffect(() => {
    const items = [
      getMenuItem("Manage LLM Profiles", 1, <CodeOutlined />),
      getMenuItem("Manage Grammar", 4, <MessageOutlined />),
      getMenuItem("Preamble", 5, <DiffOutlined />),
      getMenuItem("Postamble", 6, <DiffOutlined />),
    ];

    const listOfComponents = {
      1: <ManageLlmProfiles />,
      4: <CustomSynonyms />,
      5: (
        <PreAndPostAmbleModal
          type="PREAMBLE"
          handleUpdateTool={handleUpdateTool}
        />
      ),
      6: (
        <PreAndPostAmbleModal
          type="POSTAMBLE"
          handleUpdateTool={handleUpdateTool}
        />
      ),
    };

    if (SummarizeManager && EvaluationManager) {
      // Add Summary Manager menu item to the existing list
      items.splice(
        1,
        0,
        ...[
          getMenuItem("Summary Manager", 2, <FileTextOutlined />),
          getMenuItem("Evaluation Manager", 3, <FileTextOutlined />),
        ]
      );
      listOfComponents[2] = (
        <SummarizeManager
          llmItems={llmItems}
          handleUpdateTool={handleUpdateTool}
        />
      );
      listOfComponents[3] = (
        <EvaluationManager handleUpdateTool={handleUpdateTool} />
      );
    }

    setMenuItems(items);
    setComponents(listOfComponents);
  }, [llmItems]);

  useEffect(() => {
    getLlmProfilesDropdown();
  }, [llmProfiles]);

  const handleSelectItem = (e) => {
    const id = e.key;
    setSelectedId(id?.toString());
  };

  const getLlmProfilesDropdown = () => {
    const items = [...llmProfiles].map((item) => {
      return {
        value: item?.profile_id,
        label: item?.profile_name,
      };
    });
    setLlmItems(items);
  };

  return (
    <Modal
      open={open}
      onCancel={() => setOpen(false)}
      maskClosable={false}
      centered
      footer={null}
      width={1200}
    >
      <SpaceWrapper>
        <div>
          <Typography.Text className="add-cus-tool-header">
            Settings
          </Typography.Text>
        </div>
        <Row className="conn-modal-row" style={{ height: "800px" }}>
          <Col span={4} className="conn-modal-col conn-modal-col-left">
            <div className="conn-modal-menu conn-modal-form-pad-right">
              <Menu
                className="sidebar-menu"
                style={{ border: 0 }}
                mode="inline"
                items={menuItems}
                onClick={handleSelectItem}
                selectedKeys={[`${selectedId}`]}
              />
            </div>
          </Col>
          <Col span={20} className="conn-modal-col">
            <div className="conn-modal-form-pad-left">
              {components[selectedId]}
            </div>
          </Col>
        </Row>
      </SpaceWrapper>
    </Modal>
  );
}

SettingsModal.propTypes = {
  open: PropTypes.bool.isRequired,
  setOpen: PropTypes.func.isRequired,
  handleUpdateTool: PropTypes.func.isRequired,
};

export { SettingsModal };