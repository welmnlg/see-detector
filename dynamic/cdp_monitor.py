import json
from urllib.parse import urlparse

class CDPMonitor:
    def __init__(self, page, context, extension_id):
        self.page = page
        self.context = context
        self.extension_id = extension_id
        self.requests = []
        self.cdp_session = None
        
    def start(self):
        """Starts the CDP session and network monitoring."""
        # Create CDP session for the page
        self.cdp_session = self.context.new_cdp_session(self.page)
        
        # Enable required domains
        self.cdp_session.send("Debugger.enable")
        self.cdp_session.send("Debugger.setAsyncCallStackDepth", {"maxDepth": 32})
        self.cdp_session.send("Network.enable")
        
        # Subscribe to events
        self.cdp_session.on("Network.requestWillBeSent", self._on_request_will_be_sent)
        
    def _on_request_will_be_sent(self, event):
        """Callback for Network.requestWillBeSent event."""
        request = event.get("request", {})
        initiator = event.get("initiator", {})
        
        url = request.get("url")
        method = request.get("method")
        post_data = request.get("postData")
        
        # Check initiator stack to see if it came from our extension
        is_extension_initiated = False
        initiator_type = "page"
        
        stack = initiator.get("stack", {})
        call_frames = stack.get("callFrames", [])
        
        for frame in call_frames:
            frame_url = frame.get("url", "")
            if self.extension_id and f"chrome-extension://{self.extension_id}" in frame_url:
                is_extension_initiated = True
                if "service_worker" in frame_url or "background" in frame_url:
                    initiator_type = "service_worker"
                else:
                    initiator_type = "content_script"
                break
                
        # Fallback check on initiator url
        if not is_extension_initiated and initiator.get("type") == "script":
             url_in_initiator = initiator.get("url", "")
             if self.extension_id and f"chrome-extension://{self.extension_id}" in url_in_initiator:
                 is_extension_initiated = True
                 initiator_type = "service_worker" if "worker" in url_in_initiator else "content_script"

        req_data = {
            "url": url,
            "method": method,
            "domain": urlparse(url).netloc,
            "post_data": post_data,
            "is_extension_initiated": is_extension_initiated,
            "initiator_type": initiator_type,
            "timestamp": event.get("wallTime", 0)
        }
        
        self.requests.append(req_data)

    def get_extension_requests(self):
        """Returns only the HTTP requests that were initiated by the extension."""
        return [r for r in self.requests if r["is_extension_initiated"]]
        
    def get_all_requests(self):
        """Returns all captured requests."""
        return self.requests
