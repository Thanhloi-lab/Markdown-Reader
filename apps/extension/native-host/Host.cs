using System;
using System.IO;
using System.Text;
using System.Collections.Generic;
using System.Web.Script.Serialization;

namespace MarkdownReaderNativeHost
{
    class Program
    {
        private static readonly HashSet<string> SupportedExtensions = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            ".md", ".markdown", ".mdown", ".mkdn", ".mkd", ".mdx",
            ".txt", ".json", ".xml", ".yaml", ".yml", ".toml", ".csv",
            ".js", ".ts", ".jsx", ".tsx", ".cs", ".py",
            ".html", ".css", ".scss", ".sh", ".sql", ".log"
        };

        private static readonly HashSet<string> IgnoredDirectories = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
        {
            "node_modules", "dist", "build", "out", "target", "bin", "obj",
            ".next", ".nuxt", ".output", ".turbo", "vendor", "coverage", "pods",
            "__pycache__", "appdata", "application data", "$recycle.bin",
            "system volume information", "windows", "program files", "program files (x86)",
            "temp", "cache", ".cache"
        };

        static void Main(string[] args)
        {
            var serializer = new JavaScriptSerializer();
            serializer.MaxJsonLength = int.MaxValue;

            using (var stdin = Console.OpenStandardInput())
            using (var reader = new BinaryReader(stdin))
            using (var stdout = Console.OpenStandardOutput())
            using (var writer = new BinaryWriter(stdout))
            {
                while (true)
                {
                    int length;
                    try
                    {
                        length = reader.ReadInt32();
                    }
                    catch (EndOfStreamException)
                    {
                        break;
                    }
                    catch (Exception)
                    {
                        break;
                    }

                    if (length <= 0) break;

                    byte[] bytes = reader.ReadBytes(length);
                    string json = Encoding.UTF8.GetString(bytes);

                    Dictionary<string, object> req;
                    try
                    {
                        req = serializer.Deserialize<Dictionary<string, object>>(json);
                    }
                    catch (Exception ex)
                    {
                        SendResponse(writer, serializer, new Dictionary<string, object>
                        {
                            { "success", false },
                            { "error", "Invalid JSON: " + ex.Message }
                        });
                        continue;
                    }

                    string action = req.ContainsKey("action") ? req["action"].ToString() : "";

                    if (action == "ping")
                    {
                        SendResponse(writer, serializer, new Dictionary<string, object>
                        {
                            { "success", true },
                            { "pong", true },
                            { "version", "1.3.0" }
                        });
                        continue;
                    }

                    if (action == "scanDirectory")
                    {
                        string rawPath = req.ContainsKey("path") ? req["path"].ToString() : "";
                        string dirPath = NormalizePath(rawPath);

                        if (File.Exists(dirPath))
                        {
                            try
                            {
                                dirPath = Path.GetDirectoryName(dirPath);
                            }
                            catch { }
                        }

                        if (string.IsNullOrEmpty(dirPath) || !Directory.Exists(dirPath))
                        {
                            SendResponse(writer, serializer, new Dictionary<string, object>
                            {
                                { "success", false },
                                { "error", "Directory does not exist: " + dirPath }
                            });
                            continue;
                        }

                        string activeFilePath = req.ContainsKey("activeFilePath") ? req["activeFilePath"].ToString() : "";
                        string activeNorm = NormalizePath(activeFilePath).Replace('\\', '/');

                        bool shallow = true; // Mặc định chế độ nạp theo cấp (shallow)
                        if (req.ContainsKey("shallow"))
                        {
                            bool.TryParse(req["shallow"].ToString(), out shallow);
                        }

                        int maxDepth = 4;
                        if (req.ContainsKey("maxDepth"))
                        {
                            int customDepth;
                            if (int.TryParse(req["maxDepth"].ToString(), out customDepth) && customDepth > 0)
                            {
                                maxDepth = customDepth;
                            }
                        }

                        try
                        {
                            int fileCount = 0;
                            int dirCount = 0;
                            var rootNode = ScanDirectory(dirPath, ref fileCount, ref dirCount, 0, activeNorm, shallow, maxDepth, 2500);

                            SendResponse(writer, serializer, new Dictionary<string, object>
                            {
                                { "success", true },
                                { "rootNode", rootNode },
                                { "fileCount", fileCount },
                                { "dirCount", dirCount }
                            });
                        }
                        catch (Exception ex)
                        {
                            SendResponse(writer, serializer, new Dictionary<string, object>
                            {
                                { "success", false },
                                { "error", ex.Message }
                            });
                        }
                        continue;
                    }

                    if (action == "readFile")
                    {
                        string rawPath = req.ContainsKey("path") ? req["path"].ToString() : "";
                        string filePath = NormalizePath(rawPath);

                        if (string.IsNullOrEmpty(filePath) || !File.Exists(filePath))
                        {
                            SendResponse(writer, serializer, new Dictionary<string, object>
                            {
                                { "success", false },
                                { "error", "File does not exist: " + filePath }
                            });
                            continue;
                        }

                        try
                        {
                            string text = File.ReadAllText(filePath, Encoding.UTF8);
                            SendResponse(writer, serializer, new Dictionary<string, object>
                            {
                                { "success", true },
                                { "content", text }
                            });
                        }
                        catch (Exception ex)
                        {
                            SendResponse(writer, serializer, new Dictionary<string, object>
                            {
                                { "success", false },
                                { "error", ex.Message }
                            });
                        }
                        continue;
                    }

                    SendResponse(writer, serializer, new Dictionary<string, object>
                    {
                        { "success", false },
                        { "error", "Unknown action: " + action }
                    });
                }
            }
        }

        private static string NormalizePath(string rawPath)
        {
            if (string.IsNullOrEmpty(rawPath)) return "";
            string p = rawPath.Trim();
            if (p.StartsWith("file:///", StringComparison.OrdinalIgnoreCase))
            {
                p = p.Substring(8);
            }
            else if (p.StartsWith("file://", StringComparison.OrdinalIgnoreCase))
            {
                p = p.Substring(7);
            }

            try
            {
                p = Uri.UnescapeDataString(p);
            }
            catch { }

            p = p.Replace('/', '\\');

            while (p.StartsWith("\\") && p.Length > 2 && p[2] == ':')
            {
                p = p.Substring(1);
            }

            return p.TrimEnd('\\');
        }

        private static Dictionary<string, object> ScanDirectory(
            string dirPath,
            ref int fileCount,
            ref int dirCount,
            int currentDepth,
            string activeNorm,
            bool shallow,
            int maxDepth,
            int maxFiles)
        {
            var dirInfo = new DirectoryInfo(dirPath);
            var children = new List<Dictionary<string, object>>();

            // 1. Quét các tập tin trong thư mục hiện tại TRƯỚC TIÊN (Ưu tiên hiển thị tệp ở cấp cha)
            try
            {
                foreach (var file in dirInfo.GetFiles())
                {
                    if (file.Name.StartsWith(".")) continue;

                    try
                    {
                        if ((file.Attributes & FileAttributes.Hidden) != 0 ||
                            (file.Attributes & FileAttributes.System) != 0)
                        {
                            continue;
                        }
                    }
                    catch { }

                    if (SupportedExtensions.Contains(file.Extension))
                    {
                        fileCount++;
                        string normPath = file.FullName.Replace('\\', '/');
                        children.Add(new Dictionary<string, object>
                        {
                            { "id", normPath },
                            { "name", file.Name },
                            { "path", normPath },
                            { "isDirectory", false }
                        });

                        if (fileCount >= maxFiles)
                        {
                            break;
                        }
                    }
                }
            }
            catch { }

            // 2. Quét các thư mục con
            try
            {
                foreach (var subDir in dirInfo.GetDirectories())
                {
                    if (subDir.Name.StartsWith(".") || IgnoredDirectories.Contains(subDir.Name))
                    {
                        continue;
                    }

                    try
                    {
                        if ((subDir.Attributes & FileAttributes.Hidden) != 0 ||
                            (subDir.Attributes & FileAttributes.System) != 0)
                        {
                            continue;
                        }
                    }
                    catch { }

                    dirCount++;
                    string normSubPath = subDir.FullName.Replace('\\', '/');

                    bool isActiveBranch = !string.IsNullOrEmpty(activeNorm) &&
                        (activeNorm.Equals(normSubPath, StringComparison.OrdinalIgnoreCase) ||
                         activeNorm.StartsWith(normSubPath + "/", StringComparison.OrdinalIgnoreCase));

                    // Nếu ở chế độ shallow và thư mục này không nằm trên đường dẫn tới active file: chỉ tạo node thư mục rỗng (lazy loading)
                    if (shallow && !isActiveBranch)
                    {
                        children.Add(new Dictionary<string, object>
                        {
                            { "id", normSubPath },
                            { "name", subDir.Name },
                            { "path", normSubPath },
                            { "isDirectory", true },
                            { "isLoaded", false },
                            { "children", new List<Dictionary<string, object>>() }
                        });
                    }
                    else
                    {
                        // Nếu là nhánh chứa active file hoặc không bật shallow
                        if (currentDepth < maxDepth && fileCount < maxFiles)
                        {
                            var subNode = ScanDirectory(subDir.FullName, ref fileCount, ref dirCount, currentDepth + 1, activeNorm, shallow, maxDepth, maxFiles);
                            children.Add(subNode);

                            if (fileCount >= maxFiles)
                            {
                                break;
                            }
                        }
                        else
                        {
                            children.Add(new Dictionary<string, object>
                            {
                                { "id", normSubPath },
                                { "name", subDir.Name },
                                { "path", normSubPath },
                                { "isDirectory", true },
                                { "isLoaded", false },
                                { "children", new List<Dictionary<string, object>>() }
                            });
                        }
                    }
                }
            }
            catch { }

            // Sắp xếp: Thư mục lên trước, tệp xuống sau
            children.Sort((a, b) =>
            {
                bool aIsDir = (bool)a["isDirectory"];
                bool bIsDir = (bool)b["isDirectory"];
                if (aIsDir != bIsDir) return aIsDir ? -1 : 1;
                return string.Compare(a["name"].ToString(), b["name"].ToString(), StringComparison.OrdinalIgnoreCase);
            });

            string normalizedDirPath = dirInfo.FullName.Replace('\\', '/');
            return new Dictionary<string, object>
            {
                { "id", normalizedDirPath },
                { "name", dirInfo.Name },
                { "path", normalizedDirPath },
                { "isDirectory", true },
                { "isLoaded", true },
                { "children", children }
            };
        }

        private static void SendResponse(BinaryWriter writer, JavaScriptSerializer serializer, object obj)
        {
            string json = serializer.Serialize(obj);
            byte[] bytes = Encoding.UTF8.GetBytes(json);

            // Chrome Native Messaging giới hạn kích thước tối đa của mỗi tin nhắn là 1 MB (1,048,576 bytes)
            if (bytes.Length > 1000 * 1024)
            {
                var errObj = new Dictionary<string, object>
                {
                    { "success", false },
                    { "error", "Kích thước dữ liệu cây thư mục (" + (bytes.Length / 1024) + " KB) vượt quá giới hạn 1MB của trình duyệt. Vui lòng mở trực tiếp thư mục con." }
                };
                string errJson = serializer.Serialize(errObj);
                byte[] errBytes = Encoding.UTF8.GetBytes(errJson);
                writer.Write(errBytes.Length);
                writer.Write(errBytes);
                writer.Flush();
                return;
            }

            writer.Write(bytes.Length);
            writer.Write(bytes);
            writer.Flush();
        }
    }
}