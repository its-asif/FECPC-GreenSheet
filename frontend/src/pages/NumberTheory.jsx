import React, { useState } from 'react';

export default function NumberTheory() {
  const [copiedSection, setCopiedSection] = useState(null);

  const handleCopy = (text, sectionId) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const codeSnippets = {
    monkeyDivisors: `#include<bits/stdc++.h>
using namespace std;

int32_t main() {
  ios_base::sync_with_stdio(0);
  cin.tie(0);
  int n; cin >> n;
  for (int i = 1; i <= n; i++) {
    if (n % i == 0) {
      cout << i << ' ';
    }
  }
  return 0;
}`,
    humanDivisors: `#include<bits/stdc++.h>
using namespace std;

int32_t main() {
  ios_base::sync_with_stdio(0);
  cin.tie(0);
  int n; cin >> n;
  vector<int> divs;
  for (int i = 1; i * i <= n; i++) {
    if (n % i == 0) {
      divs.push_back(i);
      if (i != n / i) divs.push_back(n / i);
    }
  }
  sort(divs.begin(), divs.end());
  for (auto x: divs) cout << x << ' ';
  return 0;
}`,
    primality: `#include<bits/stdc++.h>
using namespace std;

bool is_prime(int n) {
  if (n <= 1) return false;
  for (int i = 2; i * i <= n; i++) {
    if (n % i == 0) {
      return false;
    }
  }
  return true;
}

int32_t main() {
  ios_base::sync_with_stdio(0);
  cin.tie(0);
  cout << is_prime(7) << '\\n';
  return 0;
}`,
    skeletonView: `#include<bits/stdc++.h>
using namespace std;

int32_t main() {
  ios_base::sync_with_stdio(0);
  cin.tie(0);
  int n; cin >> n;
  vector<int> v;
  for (int i = 2; i * i <= n; i++) {
    if (n % i == 0) {
      while (n % i == 0) {
        v.push_back(i);
        n /= i;
      }
    }
  }
  if (n > 1) v.push_back(n);
  for (auto x: v) cout << x << ' ';
  return 0;
}`,
    sieve: `#include<bits/stdc++.h>
using namespace std;

vector<int> sieve(int n) {
  vector<bool> is_prime(n + 1, true);
  is_prime[0] = is_prime[1] = false;
  for (int i = 2; i * i <= n; i++) {
    if (is_prime[i]) {
      for (int j = i * i; j <= n; j += i)
        is_prime[j] = false;
    }
  }
  vector<int> primes;
  for (int i = 2; i <= n; i++) {
    if (is_prime[i]) primes.push_back(i);
  }
  return primes;
}`,
    divisorSieve: `#include<bits/stdc++.h>
using namespace std;

const int MAXN = 1000000;
int divisor_count[MAXN + 1];

void precomputeDivisors() {
  for (int i = 1; i <= MAXN; i++) {
    for (int j = i; j <= MAXN; j += i) {
      divisor_count[j]++;
    }
  }
}`,
    spfSieve: `#include<bits/stdc++.h>
using namespace std;

const int MAXN = 1000000;
int spf[MAXN + 1];

void sieveSPF() {
  for (int i = 1; i <= MAXN; i++) spf[i] = i;
  for (int i = 2; i * i <= MAXN; i++) {
    if (spf[i] == i) {
      for (int j = i * i; j <= MAXN; j += i) {
        if (spf[j] == j) spf[j] = i;
      }
    }
  }
}

vector<int> getFactorizationSPF(int x) {
  vector<int> factors;
  while (x > 1) {
    factors.push_back(spf[x]);
    x /= spf[x];
  }
  return factors;
}`,
    euclidGcd: `#include<bits/stdc++.h>
using namespace std;

int gcd(int a, int b) {
  return b == 0 ? a : gcd(b, a % b);
}

int lcm(int a, int b) {
  return (a / gcd(a, b)) * b;
}`,
    eulerTotient: `#include<bits/stdc++.h>
using namespace std;

int phi(int n) {
  int result = n;
  for (int i = 2; i * i <= n; i++) {
    if (n % i == 0) {
      while (n % i == 0) {
        n /= i;
      }
      result -= result / i;
    }
  }
  if (n > 1) {
    result -= result / n;
  }
  return result;
}`
  };

  const toc = [
    { id: 'divisors', label: '1. Divisors' },
    { id: 'monkey-way', label: '2. Divisors (Monkey Way)' },
    { id: 'human-way', label: '3. Divisors (Human Way)' },
    { id: 'odd-divisors', label: '4. Odd Divisors' },
    { id: 'primes-composites', label: '5. Primes & Composites' },
    { id: 'euclids-lemma', label: '6. Euclid\'s Lemma' },
    { id: 'fundamental-theorem', label: '7. Fundamental Theorem' },
    { id: 'miserable-one', label: '8. Miserable Fate of 1' },
    { id: 'primality-test', label: '9. Primality Test' },
    { id: 'spf', label: '10. Smallest Prime Factor' },
    { id: 'skeleton-view', label: '11. The Skeleton View' },
    { id: 'wtf-facts', label: '12. WTF Facts' },
    { id: 'num-divisors', label: '13. Number of Divisors' },
    { id: 'num-divisors-skeleton', label: '14. Divisors via Skeleton' },
    { id: 'upper-bound-divisors', label: '15. Upper Bound' },
    { id: 'sum-divisors', label: '16. Sum of Divisors' },
    { id: 'sieve', label: '17. Sieve of Eratosthenes' },
    { id: 'harmonic-series', label: '18. Harmonic Complexity' },
    { id: 'divisor-count-sieve', label: '19. Divisors from 1 to N' },
    { id: 'factorization-sieve', label: '20. Factorization Sieve' },
    { id: 'prime-gap', label: '21. Prime Gap' },
    { id: 'gcd-lcm', label: '22. GCD & LCM' },
    { id: 'euclids-algorithm', label: '23. Euclid\'s Algorithm' },
    { id: 'geometric-proof', label: '24. Geometric Proof' },
    { id: 'coprimes', label: '25. Coprimes' },
    { id: 'fun-facts', label: '26. Fun Facts' },
    { id: 'nt-hack', label: '27. The NT Hack' },
    { id: 'basic-problems', label: '28. Basic Problems' },
    { id: 'bonus-totient', label: '29. Bonus: Euler Totient' },
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Title & Introduction */}
      <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #1e1b4b, #111827)' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '8px', color: '#818cf8' }}>1.0 Basic Number Theory</h1>
        <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '700px', margin: '0 auto' }}>
          Number Theory is a cornerstone of competitive programming. Understanding prime numbers, modular math, and fast power algorithms is essential for solving complex divisibility and combinatorics tasks.
        </p>
      </div>

      {/* Quick Table of Contents Grid */}
      <div className="card">
        <h3 style={{ marginBottom: '16px', fontSize: '18px', borderBottom: '1px solid #2e3752', paddingBottom: '8px' }}>
          Topics Index
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {toc.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              style={{
                background: '#1f263f',
                border: '1px solid #2e3752',
                color: '#e2e8f0',
                padding: '10px 12px',
                borderRadius: '8px',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: '500',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#6366f1';
                e.target.style.borderColor = '#6366f1';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#1f263f';
                e.target.style.borderColor = '#2e3752';
              }}
            >
              👉 {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Video Card */}
      {/* <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <h3 style={{ alignSelf: 'flex-start' }}>Video Class</h3>
        <p style={{ alignSelf: 'flex-start', color: '#cbd5e1', margin: 0 }}>
          Today we will rant about my personal favourite topic. Soon, you are gonna find out how fun Number Theory is!
        </p>
        <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: '0', borderRadius: '12px', overflow: 'hidden' }}>
          <iframe
            style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', border: '0' }}
            src="https://player.vimeo.com/video/1063170891?title=0&amp;byline=0&amp;portrait=0&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
            title="Phase 2 Class 1"
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
            allowFullScreen
          ></iframe>
        </div>
        <div style={{
          background: 'rgba(99, 102, 241, 0.1)',
          borderLeft: '4px solid #6366f1',
          padding: '12px 16px',
          borderRadius: '4px',
          width: '100%',
          fontSize: '14px',
          color: '#c7d2fe',
        }}>
          💡 <strong>Tip:</strong> You can find all the practice problems in the practice class (check the next class with the word "[Practice]" in the title). But first watch the video class and read the following content.
        </div>
      </div> */}

      {/* Divisors Section */}
      <div id="divisors" className="card">
        <h2>1. Divisors</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          What do we mean when we say that a number <code>m</code> divides <code>a</code> or <code>m | a</code>?
        </p>
        <p style={{ color: '#cbd5e1' }}>
          A divisor of an integer <code>n</code>, also called a factor of <code>n</code>, is an integer <code>m</code> that may be multiplied by some integer to produce <code>n</code>. In this case, one also says that <code>n</code> is a multiple of <code>m</code>. An integer <code>n</code> is divisible or evenly divisible by another integer <code>m</code> if <code>m</code> is a divisor of <code>n</code>; this implies dividing <code>n</code> by <code>m</code> leaves no remainder. - Wiki
        </p>
      </div>

      {/* Monkey Way */}
      <div id="monkey-way" className="card">
        <h2>2. Enumerating Divisors (Monkey Way)</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '16px' }}>
          How to enumerate the divisors of <code>n</code> in <code>O(n)</code>? We loop from 1 all the way to <code>n</code>. This is the naive way.
        </p>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => handleCopy(codeSnippets.monkeyDivisors, 'monkeyDivisors')}
            className="button secondary"
            style={{ position: 'absolute', right: '8px', top: '8px', padding: '6px 12px', fontSize: '12px', zIndex: 10 }}
          >
            {copiedSection === 'monkeyDivisors' ? 'Copied! ✅' : 'Copy Code 📋'}
          </button>
          <pre style={{ background: '#0b0f19', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontFamily: 'Courier New, monospace' }}>
            <code style={{ color: '#38bdf8' }}>{codeSnippets.monkeyDivisors}</code>
          </pre>
        </div>
      </div>

      {/* Human Way */}
      <div id="human-way" className="card">
        <h2>3. Enumerating Divisors (Human Way)</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          How to enumerate the divisors of <code>n</code> in <code>O(√n)</code>?
        </p>
        <p style={{ color: '#cbd5e1', marginBottom: '16px' }}>
          Since divisors always appear in pairs (if <code>d</code> divides <code>n</code>, then <code>n/d</code> also divides <code>n</code>), we only need to search up to <code>√n</code>.
        </p>
        <p style={{ color: '#cbd5e1', marginBottom: '16px' }}>
          Tutorial: <a target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }} href="https://forthright48.com/number-of-divisors-of-integer">forthright48 link</a>.
        </p>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => handleCopy(codeSnippets.humanDivisors, 'humanDivisors')}
            className="button secondary"
            style={{ position: 'absolute', right: '8px', top: '8px', padding: '6px 12px', fontSize: '12px', zIndex: 10 }}
          >
            {copiedSection === 'humanDivisors' ? 'Copied! ✅' : 'Copy Code 📋'}
          </button>
          <pre style={{ background: '#0b0f19', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontFamily: 'Courier New, monospace' }}>
            <code style={{ color: '#38bdf8' }}>{codeSnippets.humanDivisors}</code>
          </pre>
        </div>
      </div>

      {/* Odd Divisors */}
      <div id="odd-divisors" className="card">
        <h2>4. Odd Number of Divisors</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          How to find the number of integers under <code>n</code> that has an odd number of divisors?
        </p>
        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '16px', borderRadius: '8px', borderLeft: '4px solid #6366f1', marginBottom: '12px' }}>
          <strong>Hint:</strong> When does a number have an odd number of divisors? Think about perfect squares! For example, 36 has divisors 1, 2, 3, 4, 6, 9, 12, 18, 30... wait, 6 repeats so it only counts once! Thus, perfect squares have an odd number of divisors because their square root is paired with itself.
        </div>
        <p style={{ color: '#cbd5e1' }}>
          <strong>Hint:</strong> Try finding the first 4 of such numbers. Can you find a pattern? What is happening here? (The perfect squares: 1, 4, 9, 16, 25...). The number of perfect squares up to <code>n</code> is simply <code>floor(sqrt(n))</code>.
        </p>
      </div>

      {/* Primes & Composites */}
      <div id="primes-composites" className="card">
        <h2>5. Primes and Composites</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          Prime numbers are those numbers that have exactly two factors: 1 and itself. The first few primes are 2, 3, 5, 7, 11, 13, 17, 19, 23, 29...
        </p>
        <p style={{ color: '#cbd5e1' }}>
          A composite number is a positive integer that can be formed by multiplying two smaller positive integers. So the numbers which are not prime and not equal to 1 are composite numbers.
        </p>
      </div>

      {/* Euclid's Lemma */}
      <div id="euclids-lemma" className="card">
        <h2>6. Euclid's Lemma</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          If a prime <code>p</code> divides the product <code>a * b</code> of two integers <code>a</code> and <code>b</code>, then <code>p</code> must divide at least one of those integers <code>a</code> and <code>b</code>.
        </p>
        <p style={{ color: '#cbd5e1' }}>
          For more details, see the <a target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }} href="https://en.wikipedia.org/wiki/Euclid%27s_lemma">Wikipedia link</a>.
        </p>
      </div>

      {/* Fundamental Theorem */}
      <div id="fundamental-theorem" className="card">
        <h2>7. Fundamental Theorem of Arithmetic</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          The fundamental theorem of arithmetic, also called the unique factorization theorem, states that every integer greater than 1 can be represented <strong>UNIQUELY</strong> as a product of prime numbers. - Wiki
        </p>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          The theorem says two things about this example: first, that 12 can be represented as a product of primes, and second, that no matter how this is done, there will always be exactly one 3 and two 2s (12 = 2 * 2 * 3), and no other primes in the product. Also, this unique factorization is also called the prime factorization of the number 12.
        </p>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          Proof details: <a target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }} href="https://en.wikipedia.org/wiki/Fundamental_theorem_of_arithmetic#Proof">Fermat/Euclid proof link</a>.
        </p>
        <p style={{ color: '#cbd5e1', fontStyle: 'italic', fontWeight: 'bold' }}>
          So the prime numbers are the building blocks of all numbers. You need to FEEL it.
        </p>
      </div>

      {/* Miserable Fate of 1 */}
      <div id="miserable-one" className="card">
        <h2>8. The Miserable Fate of 1</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          1 is <strong>not</strong> a prime number. Why? Because it doesn't have <strong>exactly 2</strong> divisors.
        </p>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          <em>What would have happened if 1 was a prime number?</em>
        </p>
        <p style={{ color: '#cbd5e1', marginBottom: '16px' }}>
          Chaos! Because then every number could have represented using product of primes in different ways. For example: 6 = 2 * 3 = 2 * 3 * 1 = 2 * 3 * 1 * 1... You got the idea right? The uniqueness of prime factorization would fall apart.
        </p>
        <p style={{ color: '#cbd5e1', marginBottom: '16px' }}>
          1 is <strong>not</strong> a composite number either. Why? Because it has less than 2 divisors.
        </p>
        <div style={{ textAlign: 'center', margin: '20px 0' }}>
          <img
            src="https://i.ibb.co/tqVC5fg/crying-cat-meme-lede-2.jpg"
            alt="Crying Cat Meme"
            style={{ maxWidth: '280px', borderRadius: '12px', border: '2px solid #2e3752' }}
          />
        </div>
        <p style={{ color: '#cbd5e1' }}>
          Instead, 1 is called the <strong>unit</strong> number.
        </p>
      </div>

      {/* Primality Test */}
      <div id="primality-test" className="card">
        <h2>9. Primality Test</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          Tutorial: <a target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }} href="https://forthright48.com/primality-test-naive-methods">forthright48 naive primality test link</a>
        </p>
        <p style={{ color: '#cbd5e1', marginBottom: '16px' }}>
          Checking if a number is prime or not in <code>O(√n)</code>:
        </p>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => handleCopy(codeSnippets.primality, 'primality')}
            className="button secondary"
            style={{ position: 'absolute', right: '8px', top: '8px', padding: '6px 12px', fontSize: '12px', zIndex: 10 }}
          >
            {copiedSection === 'primality' ? 'Copied! ✅' : 'Copy Code 📋'}
          </button>
          <pre style={{ background: '#0b0f19', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontFamily: 'Courier New, monospace' }}>
            <code style={{ color: '#38bdf8' }}>{codeSnippets.primality}</code>
          </pre>
        </div>
      </div>

      {/* SPF */}
      <div id="spf" className="card">
        <h2>10. Smallest Prime Factor (SPF)</h2>
        <p style={{ color: '#cbd5e1' }}>
          The smallest number greater than 1 that divides <code>n</code> is also the smallest <strong>prime</strong> factor of <code>n</code>. Why? Because if it were composite, then it could be divided into smaller prime factors, which would divide <code>n</code>, contradicting that it is the smallest.
        </p>
      </div>

      {/* The Skeleton View */}
      <div id="skeleton-view" className="card">
        <h2>11. The Skeleton View</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          I like to call Prime Factorization of <code>n</code> as the Skeleton View of <code>n</code> as they are analogous.
        </p>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          How to find all the prime factors of <code>n</code> in <code>O(√n)</code>?
        </p>
        <p style={{ color: '#cbd5e1', marginBottom: '16px' }}>
          Tutorial: <a target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }} href="https://www.geeksforgeeks.org/print-all-prime-factors-of-a-given-number/">GeeksforGeeks factorization link</a>.
        </p>
        <p style={{ color: '#cbd5e1', marginBottom: '16px' }}>
          In short, just find the smallest prime factor (SPF) of <code>n</code>, remove this prime factor from <code>n</code> and repeat.
        </p>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => handleCopy(codeSnippets.skeletonView, 'skeletonView')}
            className="button secondary"
            style={{ position: 'absolute', right: '8px', top: '8px', padding: '6px 12px', fontSize: '12px', zIndex: 10 }}
          >
            {copiedSection === 'skeletonView' ? 'Copied! ✅' : 'Copy Code 📋'}
          </button>
          <pre style={{ background: '#0b0f19', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontFamily: 'Courier New, monospace' }}>
            <code style={{ color: '#38bdf8' }}>{codeSnippets.skeletonView}</code>
          </pre>
        </div>
      </div>

      {/* WTF Facts */}
      <div id="wtf-facts" className="card">
        <h2>12. WTF Facts</h2>
        <ul style={{ color: '#cbd5e1', lineHeight: '1.6', paddingLeft: '20px' }}>
          <li>Did you know there are infinitely many primes? Euclid proved this in 300 BC!</li>
          <li>For any integer <code>n &gt; 1</code>, there is always at least one prime <code>p</code> such that <code>n &lt; p &lt; 2n</code>. This is called Bertrand's Postulate!</li>
          <li>All prime numbers greater than 3 can be expressed in the form <code>6k + 1</code> or <code>6k - 1</code>.</li>
        </ul>
      </div>

      {/* Number of Divisors */}
      <div id="num-divisors" className="card">
        <h2>13. Number of Divisors</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          If the prime factorization of <code>n</code> is:
        </p>
        <div style={{ background: '#0b0f19', padding: '12px', borderRadius: '8px', fontFamily: 'monospace', color: '#6ee7b7', border: '1px solid #2e3752', textAlign: 'center', marginBottom: '12px' }}>
          n = p₁<sup>a₁</sup> * p₂<sup>a₂</sup> * ... * p<sub>k</sub><sup>a<sub>k</sub></sup>
        </div>
        <p style={{ color: '#cbd5e1' }}>
          Then the total number of divisors of <code>n</code>, denoted as <code>τ(n)</code>, is given by the formula:
          <code> (a₁ + 1) * (a₂ + 1) * ... * (a<sub>k</sub> + 1)</code>.
        </p>
      </div>

      {/* Number of Divisors using the Skeleton View */}
      <div id="num-divisors-skeleton" className="card">
        <h2>14. Number of Divisors using the Skeleton View</h2>
        <p style={{ color: '#cbd5e1' }}>
          By representing <code>n</code> in its Skeleton View (prime factorization), we can see that any divisor of <code>n</code> can only choose to contain the prime factor <code>p<sub>i</sub></code> raised to some power from <code>0</code> up to <code>a<sub>i</sub></code>. This gives exactly <code>a<sub>i</sub> + 1</code> independent choices for each prime factor. Multiplying these counts gives the divisor count formula.
        </p>
      </div>

      {/* Upper Bound of Number of Divisors */}
      <div id="upper-bound-divisors" className="card">
        <h2>15. Upper Bound of Number of Divisors</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          For a given size of <code>n</code>, what is the maximum number of divisors an integer can have?
        </p>
        <ul style={{ color: '#cbd5e1', lineHeight: '1.6', paddingLeft: '20px' }}>
          <li>For <code>n ≤ 10<sup>9</sup></code>, the maximum divisor count is <strong>1,344</strong> (for 735,134,400).</li>
          <li>For <code>n ≤ 10<sup>12</sup></code>, the maximum divisor count is <strong>6,720</strong>.</li>
          <li>For <code>n ≤ 10<sup>18</sup></code>, the maximum divisor count is <strong>103,680</strong>.</li>
        </ul>
        <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '12px 16px', borderRadius: '4px', borderLeft: '4px solid #6366f1', color: '#c7d2fe', fontSize: '14px', marginTop: '12px' }}>
          💡 <strong>CP Tip:</strong> Knowing this upper bound is highly useful. If a problem states <code>N ≤ 10<sup>9</sup></code>, and you need to run an algorithm on all pairs of divisors of <code>N</code>, the complexity is <code>O(1344²) ≈ O(1.8 * 10⁶)</code>, which executes instantly!
        </div>
      </div>

      {/* Sum of Divisors */}
      <div id="sum-divisors" className="card">
        <h2>16. Sum of Divisors</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          The sum of all divisors of <code>n</code>, denoted as <code>σ(n)</code>, is calculated using the prime factorization:
        </p>
        <div style={{ background: '#0b0f19', padding: '12px', borderRadius: '8px', fontFamily: 'monospace', color: '#6ee7b7', border: '1px solid #2e3752', textAlign: 'center', marginBottom: '12px' }}>
          σ(n) = ∏<sub>i=1..k</sub> (p<sub>i</sub><sup>a<sub>i</sub>+1</sup> - 1) / (p<sub>i</sub> - 1)
        </div>
        <p style={{ color: '#cbd5e1' }}>
          This formula is derived from expanding the product of geometric series for each prime factor.
        </p>
      </div>

      {/* Sieve */}
      <div id="sieve" className="card">
        <h2>17. Sieve of Eratosthenes</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '16px' }}>
          To find all prime numbers up to <code>N</code> efficiently, running the <code>O(√N)</code> primality test for each number takes <code>O(N√N)</code>, which is too slow. The Sieve of Eratosthenes solves this in <code>O(N log log N)</code> time.
        </p>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => handleCopy(codeSnippets.sieve, 'sieve')}
            className="button secondary"
            style={{ position: 'absolute', right: '8px', top: '8px', padding: '6px 12px', fontSize: '12px', zIndex: 10 }}
          >
            {copiedSection === 'sieve' ? 'Copied! ✅' : 'Copy Code 📋'}
          </button>
          <pre style={{ background: '#0b0f19', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontFamily: 'Courier New, monospace' }}>
            <code style={{ color: '#38bdf8' }}>{codeSnippets.sieve}</code>
          </pre>
        </div>
      </div>

      {/* Harmonic Series */}
      <div id="harmonic-series" className="card">
        <h2>18. Harmonic Series and Proof of the Complexity of Sieve</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          Why is the complexity of Sieve <code>O(N log log N)</code>?
        </p>
        <p style={{ color: '#cbd5e1' }}>
          In the sieve, for each prime <code>p</code>, we mark its multiples up to <code>N</code>. The number of operations is <code>N/2 + N/3 + N/5 + N/7 + ... = N * ∑ (1/p)</code>. By the prime harmonic series sum theorem, the sum of reciprocals of primes up to <code>N</code> grows as <code>O(log log N)</code>. Thus, the total complexity is <code>O(N log log N)</code>, which behaves almost linearly.
        </p>
      </div>

      {/* Divisors from 1 to N */}
      <div id="divisor-count-sieve" className="card">
        <h2>19. Divisor Count for integers from 1 to N</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '16px' }}>
          How can we find the divisor counts for all numbers from 1 to <code>N</code> in <code>O(N log N)</code>? We can run a sieve-like technique where each number increments the count of its multiples.
        </p>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => handleCopy(codeSnippets.divisorSieve, 'divisorSieve')}
            className="button secondary"
            style={{ position: 'absolute', right: '8px', top: '8px', padding: '6px 12px', fontSize: '12px', zIndex: 10 }}
          >
            {copiedSection === 'divisorSieve' ? 'Copied! ✅' : 'Copy Code 📋'}
          </button>
          <pre style={{ background: '#0b0f19', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontFamily: 'Courier New, monospace' }}>
            <code style={{ color: '#38bdf8' }}>{codeSnippets.divisorSieve}</code>
          </pre>
        </div>
      </div>

      {/* Factorization Sieve */}
      <div id="factorization-sieve" className="card">
        <h2>20. Prime Factorization using Sieve (SPF Sieve)</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '16px' }}>
          When we need to factorize multiple queries, standard <code>O(√N)</code> factorization is too slow. By running a Sieve and keeping track of the Smallest Prime Factor (SPF) for each number, we can factorize any query in <code>O(log N)</code> time!
        </p>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => handleCopy(codeSnippets.spfSieve, 'spfSieve')}
            className="button secondary"
            style={{ position: 'absolute', right: '8px', top: '8px', padding: '6px 12px', fontSize: '12px', zIndex: 10 }}
          >
            {copiedSection === 'spfSieve' ? 'Copied! ✅' : 'Copy Code 📋'}
          </button>
          <pre style={{ background: '#0b0f19', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontFamily: 'Courier New, monospace' }}>
            <code style={{ color: '#38bdf8' }}>{codeSnippets.spfSieve}</code>
          </pre>
        </div>
      </div>

      {/* Prime Gap */}
      <div id="prime-gap" className="card">
        <h2>21. Prime Gap</h2>
        <p style={{ color: '#cbd5e1' }}>
          The distance between consecutive prime numbers is surprisingly small. For example, for <code>N ≤ 10<sup>9</sup></code>, the maximum gap between adjacent primes is only 282. This means that if we need to find the next prime greater than <code>X</code>, we will find it very quickly by checking consecutive odd numbers.
        </p>
      </div>

      {/* GCD & LCM */}
      <div id="gcd-lcm" className="card">
        <h2>22. Greatest Common Divisor (GCD) & LCM</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          The Greatest Common Divisor (GCD) of two integers is the largest positive integer that divides both numbers. The Least Common Multiple (LCM) is the smallest positive integer divisible by both.
        </p>
        <p style={{ color: '#cbd5e1' }}>
          They are bound by the fundamental relation: <code>gcd(a, b) * lcm(a, b) = a * b</code>.
        </p>
      </div>

      {/* Euclid's Algorithm */}
      <div id="euclids-algorithm" className="card">
        <h2>23. Euclid's Algorithm</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '16px' }}>
          Euclid's algorithm allows computing the GCD of two numbers in logarithmic time <code>O(log(min(a, b)))</code> by iteratively applying <code>gcd(a, b) = gcd(b, a % b)</code>.
        </p>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => handleCopy(codeSnippets.euclidGcd, 'euclidGcd')}
            className="button secondary"
            style={{ position: 'absolute', right: '8px', top: '8px', padding: '6px 12px', fontSize: '12px', zIndex: 10 }}
          >
            {copiedSection === 'euclidGcd' ? 'Copied! ✅' : 'Copy Code 📋'}
          </button>
          <pre style={{ background: '#0b0f19', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontFamily: 'Courier New, monospace' }}>
            <code style={{ color: '#38bdf8' }}>{codeSnippets.euclidGcd}</code>
          </pre>
        </div>
      </div>

      {/* Geometric Proof */}
      <div id="geometric-proof" className="card">
        <h2>24. Geometric Proof of Euclid's Algorithm</h2>
        <p style={{ color: '#cbd5e1' }}>
          Consider a grid of size <code>a * b</code>. We want to tile it completely using identical square tiles of side length <code>g</code>. The side length of the largest square tile that can tile the grid without gaps or overlaps is exactly <code>gcd(a, b)</code>. When we execute the modulo operation <code>a % b</code>, we are recursively tiling the remaining grid of size <code>b * (a % b)</code>.
        </p>
      </div>

      {/* Coprimes */}
      <div id="coprimes" className="card">
        <h2>25. Coprimes</h2>
        <p style={{ color: '#cbd5e1' }}>
          Two integers <code>a</code> and <code>b</code> are said to be coprime (or relatively prime) if their greatest common divisor is 1: <code>gcd(a, b) = 1</code>.
        </p>
      </div>

      {/* Fun Facts */}
      <div id="fun-facts" className="card">
        <h2>26. Fun Facts</h2>
        <ul style={{ color: '#cbd5e1', lineHeight: '1.6', paddingLeft: '20px' }}>
          <li><strong>Goldbach's Conjecture:</strong> Every even integer greater than 2 is the sum of two primes. This remains unsolved to this day!</li>
          <li><strong>Twin Primes:</strong> Prime numbers that differ by 2 (like 11 and 13). It is conjectured there are infinitely many twin primes.</li>
        </ul>
      </div>

      {/* The NT Hack */}
      <div id="nt-hack" className="card">
        <h2>27. The NT Hack (Negative Modulo)</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          In C++, the modulo operator returns a negative result if the dividend is negative (e.g. <code>-5 % 3 = -2</code>).
        </p>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px 16px', borderRadius: '4px', borderLeft: '4px solid #ef4444', color: '#fca5a5', fontSize: '14px' }}>
          ⚠️ <strong>Hack:</strong> Always use the following formula to get a positive modular result: <code>(a % M + M) % M</code>.
        </div>
      </div>

      {/* Basic Problems */}
      <div id="basic-problems" className="card">
        <h2>28. Basic Problems to Practice</h2>
        <ul style={{ color: '#cbd5e1', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li><a target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }} href="https://codeforces.com/problemset/problem/154/B">Codeforces 154B - Colliders</a> (SPF / Factorization)</li>
          <li><a target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }} href="https://lightoj.com/problem/extreme-gcd-ii">LightOJ 1007 - Extreme GCD</a> (Euler Totient precomputation)</li>
          <li><a target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }} href="https://www.spoj.com/problems/PRISMS/">SPOJ - Primes Generator</a> (Segmented Sieve)</li>
        </ul>
      </div>

      {/* [Bonus] Basic Euler Totient Function */}
      <div id="bonus-totient" className="card">
        <h2>29. [Bonus] Basic Euler Totient Function</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          Euler's totient function, denoted as <code>φ(n)</code> (or phi), counts the positive integers up to <code>n</code> that are coprime to <code>n</code>.
        </p>
        <p style={{ color: '#cbd5e1', marginBottom: '16px' }}>
          The formula is: <code>φ(n) = n * ∏<sub>p|n</sub> (1 - 1/p)</code>.
        </p>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => handleCopy(codeSnippets.eulerTotient, 'eulerTotient')}
            className="button secondary"
            style={{ position: 'absolute', right: '8px', top: '8px', padding: '6px 12px', fontSize: '12px', zIndex: 10 }}
          >
            {copiedSection === 'eulerTotient' ? 'Copied! ✅' : 'Copy Code 📋'}
          </button>
          <pre style={{ background: '#0b0f19', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontFamily: 'Courier New, monospace' }}>
            <code style={{ color: '#38bdf8' }}>{codeSnippets.eulerTotient}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
