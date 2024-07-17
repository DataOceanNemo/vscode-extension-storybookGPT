import Tree from "rc-tree";
import "rc-tree/assets/index.css";
import * as React from "react";
import { useEffect, useState } from "react";

interface FileNode {
  key: string;
  title: string;
  children: FileNode[];
  checked: boolean;
  indeterminate: boolean;
}

interface Props {
  files: string[];
}

const buildTree = (
  paths: string[]
): { nodes: FileNode[]; checkedKeys: string[]; fileCount: number } => {
  const root: FileNode = {
    key: "",
    title: "",
    children: [],
    checked: true,
    indeterminate: false,
  };

  const checkedKeys: string[] = [];
  let fileCount = 0;

  paths.forEach((path) => {
    const parts = path.split("\\");
    let current = root;

    parts.forEach((part, index) => {
      let node = current.children.find((child) => child.title === part);

      if (!node) {
        node = {
          key: parts.slice(0, index + 1).join("\\"),
          title: part,
          children: [],
          checked: true,
          indeterminate: false,
        };
        current.children.push(node);
        current.children.sort((a, b) => a.title.localeCompare(b.title));
      }

      current = node;

      // Add the folder keys to checkedKeys
      if (index < parts.length - 1) {
        checkedKeys.push(node.key);
      }
    });

    // Add the file key to checkedKeys
    checkedKeys.push(current.key);
    fileCount++;
  });

  return { nodes: root.children, checkedKeys, fileCount };
};

const countSelectedFiles = (
  checkedKeys: string[],
  treeData: FileNode[]
): number => {
  let count = 0;

  const countRecursively = (node: FileNode) => {
    if (node.children.length === 0) {
      if (checkedKeys.includes(node.key)) {
        count++;
      }
    } else {
      node.children.forEach((child) => countRecursively(child));
    }
  };

  treeData.forEach((node) => countRecursively(node));
  return count;
};

const FileTree: React.FC<Props> = ({ files }) => {
  const {
    nodes,
    checkedKeys: initialCheckedKeys,
    fileCount,
  } = buildTree(files);
  const [treeData, setTreeData] = useState<FileNode[]>(nodes);
  const [checkedKeys, setCheckedKeys] = useState<string[]>(initialCheckedKeys);
  const [totalFiles, setTotalFiles] = useState<number>(fileCount);
  const [selectedFilesCount, setSelectedFilesCount] = useState<number>(
    countSelectedFiles(initialCheckedKeys, nodes)
  );

  const onCheck = (checkedKeysValue: any) => {
    setCheckedKeys(checkedKeysValue);
    const newSelectedFilesCount = countSelectedFiles(
      checkedKeysValue,
      treeData
    );
    setSelectedFilesCount(newSelectedFilesCount);
  };

  const clearSelections = () => {
    setCheckedKeys([]);
    setSelectedFilesCount(0);
  };

  useEffect(() => {
    const {
      nodes,
      checkedKeys: newCheckedKeys,
      fileCount: newFileCount,
    } = buildTree(files);
    setTreeData(nodes);
    setCheckedKeys(newCheckedKeys);
    setTotalFiles(newFileCount);
    const newSelectedFilesCount = countSelectedFiles(newCheckedKeys, nodes);
    setSelectedFilesCount(newSelectedFilesCount);
  }, [files]);

  return (
    <div>
      <div>Total files: {totalFiles}</div>
      <div>Total selected files: {selectedFilesCount}</div>
      <p></p>
      <button onClick={clearSelections}>Clear All Selections</button>
      <p></p>
      <Tree
        checkable
        checkedKeys={checkedKeys}
        onCheck={onCheck}
        treeData={treeData}
        selectable={false}
      />
    </div>
  );
};

export default FileTree;