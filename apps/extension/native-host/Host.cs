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
            ".md", ".markdown", ".mdown", ".mkdn", ".mkd",
            ".txt", ".json", ".xml", ".yaml", ".yml",
            ".js", ".ts", ".jsx", ".tsx", ".cs", ".py",
            ".html", ".css", ".scss", ".sh", ".sql"
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
                            { "version", "1.1.0" }
                        });
                        continue;
                    }

                    if (action == "scanDirectory")
                    {
                        string rawPath = req.ContainsKey("path") ? req["path"].ToString() : "";
                        string dirPath = NormalizePath(rawPath);

                        if (string.IsNullOrEmpty(dirPath) || !Directory.Exists(dirPath))
                        {
                            SendResponse(writer, serializer, new Dictionary<string, object>
                            {
                                { "success", false },
                                { "error", "Directory does not exist: " + dirPath }
                            });
                            continue;
                        }

                        try
                        {
                            int fileCount = 0;
                            int dirCount = 0;
                            var rootNode = ScanDirectory(dirPath, ref fileCount, ref dirCount);

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

        private static Dictionary<string, object> ScanDirectory(string dirPath, ref int fileCount, ref int dirCount)
        {
            var dirInfo = new DirectoryInfo(dirPath);
            var children = new List<Dictionary<string, object>>();

            // Quét các thư mục con
            try
            {
                foreach (var subDir in dirInfo.GetDirectories())
                {
                    if (subDir.Name.StartsWith(".") ||
                        subDir.Name.Equals("node_modules", StringComparison.OrdinalIgnoreCase) ||
                        subDir.Name.Equals("__pycache__", StringComparison.OrdinalIgnoreCase))
                    {
                        continue;
                    }

                    dirCount++;
                    children.Add(ScanDirectory(subDir.FullName, ref fileCount, ref dirCount));
                }
            }
            catch { }

            // Quét các tập tin
            try
            {
                foreach (var file in dirInfo.GetFiles())
                {
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
                { "children", children }
            };
        }

        private static void SendResponse(BinaryWriter writer, JavaScriptSerializer serializer, object obj)
        {
            string json = serializer.Serialize(obj);
            byte[] bytes = Encoding.UTF8.GetBytes(json);
            writer.Write(bytes.Length);
            writer.Write(bytes);
            writer.Flush();
        }
    }
}
