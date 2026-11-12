import { dowload } from "@/api/user";
import { Button, Notification, Space } from "@arco-design/web-vue";
import { h } from "vue";
import type { Router } from "vue-router";

let source: EventSource | null = null;
let currentToken = "";

const getToken = () => localStorage.getItem("wornbench_token") || "";

const handleDownload = (task: any) => {
  const params = {
    fileId: task.fileIds,
  };

  dowload(params)
    .then((res) => {
      let blob: Blob;
      const fileName = task.name || "download";

      if (fileName.toLowerCase().endsWith(".pdf")) {
        blob = new Blob([res], {
          type: "application/pdf",
        });
      } else if (fileName.toLowerCase().endsWith(".xlsx")) {
        blob = new Blob([res], {
          type: "application/msexcel",
        });
      } else if (fileName.toLowerCase().endsWith(".docx")) {
        blob = new Blob([res], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });
      } else if (fileName.toLowerCase().endsWith(".zip")) {
        blob = new Blob([res], {
          type: "application/zip",
        });
      } else {
        blob = new Blob([res], {
          type: "application/msexcel",
        });
      }

      const elink = document.createElement("a");
      elink.download = fileName;
      elink.style.display = "none";
      elink.href = URL.createObjectURL(blob);
      document.body.appendChild(elink);
      elink.click();
      document.body.removeChild(elink);
      URL.revokeObjectURL(elink.href);
    })
    .catch(() => {
      Notification.error({
        title: "\u4e0b\u8f7d\u5931\u8d25",
        content: "\u6587\u4ef6\u4e0b\u8f7d\u8fc7\u7a0b\u4e2d\u51fa\u73b0\u9519\u8bef",
      });
    });
};

const handlePreview = (router: Router, task: any) => {
  if (!task?.fileIds) {
    Notification.warning({
      title: "\u65e0\u6cd5\u9884\u89c8",
      content: "\u6682\u65e0\u6587\u4ef6\u53ef\u9884\u89c8",
    });
    return;
  }

  const { href } = router.resolve({
    name: "iframePreview",
    query: {
      fileId: task.fileIds,
      ...(task.name ? { fileName: task.name } : {}),
    },
  });

  window.open(href, "_blank", "noopener,noreferrer");
};

export const closeTaskCenterEventSource = () => {
  source?.close();
  source = null;
  currentToken = "";
};

export const initTaskCenterEventSource = (router: Router) => {
  const token = getToken();

  if (!token) {
    closeTaskCenterEventSource();
    return null;
  }

  if (source && currentToken === token) {
    return source;
  }

  closeTaskCenterEventSource();
  currentToken = token;
  source = new EventSource(
    `/api/internal/business/taskcenter/v1/subscribe?token=${encodeURIComponent(token)}`,
  );

  const handleDownloadReady = (event: MessageEvent<string>) => {
    const task = JSON.parse(event.data);
    const id = `download-${Date.now()}`;

    Notification.success({
      id,
      title: "\u6587\u4ef6\u751f\u6210\u6210\u529f",
      content: task.name || "\u6587\u4ef6",
      duration: 6000,
      footer: () =>
        h(Space, {}, {
          default: () => [
            h(
              Button,
              {
                type: "primary",
                size: "small",
                onClick: () => {
                  handleDownload(task);
                  Notification.remove(id);
                },
              },
              {
                default: () => "\u4e0b\u8f7d",
              },
            ),
            ...(task.fileIds
              ? [
                h(
                  Button,
                  {
                    type: "outline",
                    size: "small",
                    onClick: () => {
                      handlePreview(router, task);
                      Notification.remove(id);
                    },
                  },
                  {
                    default: () => "\u9884\u89c8",
                  },
                ),
              ]
              : []),
            h(
              Button,
              {
                type: "secondary",
                size: "small",
                onClick: () => Notification.remove(id),
              },
              {
                default: () => "\u5173\u95ed",
              },
            ),
          ],
        }),
    });
  };

  const handleGenerateFailed = (event: MessageEvent<string>) => {
    const task = JSON.parse(event.data);
    console.log("\u6587\u4ef6\u751f\u6210\u5931\u8d25", task);
  };

  source.addEventListener("download-ready", handleDownloadReady as EventListener);
  source.addEventListener("generate-failed", handleGenerateFailed as EventListener);

  return source;
};
