const filterPosts = () => {
  chrome.storage.local.get(['minRecommend'], (result) => {
    const minRec = result.minRecommend || 0;
    // 디시인사이드 일반 게시글들을 선택합니다.
    const posts = document.querySelectorAll('.ub-content.us-post');

    posts.forEach(post => {
      const recommendNode = post.querySelector('.gall_recommend');
      if (recommendNode) {
        const recommendCount = parseInt(recommendNode.innerText) || 0;
        if (recommendCount < minRec) {
          post.style.display = 'none';
        } else {
          post.style.display = '';
        }
      }
    });
  });
};

// 페이지 로드 시 실행
filterPosts();

// 디시는 페이지 이동 없이 리스트가 바뀔 수 있으므로 주기적으로 체크하거나 관찰자가 필요할 수 있습니다.
setInterval(filterPosts, 1000);