import React, { useState } from 'react';

export default function BasicNumberTheory() {
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
    largeDivisibility: `#include<bits/stdc++.h>
using namespace std;

int32_t main() {
  ios_base::sync_with_stdio(0);
  cin.tie(0);
  string a; int b; cin >> a >> b;
  int ans = 0;
  for (int i = 0; i < a.size(); i++) {
    ans = (ans * 10LL % b + (a[i] - '0')) % b;
  }
  if (ans == 0) {
    cout << "a is divisible by b\\n";
  }
  else {
    cout << "sad\\n";
  }
  return 0;
}`,
    legendre: `#include<bits/stdc++.h>
using namespace std;

int legendre(long long n, long long p) {
  int ans = 0;
  while (n) {
    ans += n / p;
    n /= p;
  }
  return ans;
}

int32_t main() {
  ios_base::sync_with_stdio(0);
  cin.tie(0);
  cout << legendre(10, 2) << '\\n'; // Highest power of 2 that divides 10!
  return 0;
}`,
    goldbach: `#include<bits/stdc++.h>
using namespace std;

const int N = 1e5 + 9;
int spf[N];
vector<int> primes;

void sieve() {
  for(int i = 2; i < N; i++) spf[i] = i;
  for(int i = 2; i * i < N; i++) {
    if (spf[i] == i) {
      for (int j = i * i; j < N; j += i) {
        if (spf[j] == j) spf[j] = i;
      }
    }
  }
  for (int i = 2; i < N; i++) {
    if (spf[i] == i) primes.push_back(i);
  }
}

void solveGoldbach(int x) {
  for (auto p : primes) {
    if (p > x) break;
    int q = x - p;
    if (spf[q] == q) {
      cout << x << " = " << p << " + " << q << '\\n';
      return;
    }
  }
}`
  };

  const toc = [
    { id: 'divisibility-2-5', label: '1. Divisibility by 2 or 5' },
    { id: 'divisibility-3-9', label: '2. Divisibility by 3 or 9' },
    { id: 'divisibility-4', label: '3. Divisibility by 4' },
    { id: 'divisibility-6', label: '4. Divisibility by 6' },
    { id: 'divisibility-11', label: '5. Divisibility by 11' },
    { id: 'large-divisibility', label: '6. Divisibility and Large Numbers' },
    { id: 'consecutive-divisibility', label: '7. K Consecutive Divisibility' },
    { id: 'divisible-by-all', label: '8. Divisible by All' },
    { id: 'pair-sums', label: '9. Pair Sums & Divisibility' },
    { id: 'hating-divisible-pairs', label: '10. Hating Divisible Pairs' },
    { id: 'legendres-formula', label: '11. Legendre\'s Formula' },
    { id: 'trailing-zeroes', label: '12. Trailing Zeroes in Factorials' },
    { id: 'divisors-factorial', label: '13. Divisors of a Factorial' },
    { id: 'odd-divisors', label: '14. Number of Odd Divisors' },
    { id: 'goldbach', label: '15. Goldbach\'s Conjecture' },
    { id: 'common-codes', label: '16. Saving Common Codes' },
    { id: 'digit-counting', label: '17. Counting Digits' },
    { id: 'big-gcd', label: '18. Big GCD' },
    { id: 'gcd-fool', label: '19. GCD & Story of a Fool' },
    { id: 'power-sum-trick', label: '20. Sum of Powers Trick' },
    { id: 'common-formulas', label: '21. Common Formulas' },
    { id: 'coding-style', label: '22. Coding Style' }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px 16px' }}>
      {/* Title Card */}
      <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #1e1b4b, #111827)' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '8px', color: '#818cf8' }}>2.0 Basic Math And Again Number Theory</h1>
        <p style={{ color: '#94a3b8', fontSize: '15px', maxWidth: '750px', margin: '0 auto' }}>
          Explore divisibility patterns, large number arithmetic, combinatorics on divisors, Legendre's theorem, factorials, and classic conjectures in competitive programming.
        </p>
      </div>

      {/* Topics Index Grid */}
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

      {/* Video Embed */}
      {/* <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <h3 style={{ alignSelf: 'flex-start' }}>Video Class</h3>
        <p style={{ alignSelf: 'flex-start', color: '#cbd5e1', margin: 0 }}>
          Watch this class to build strong intuition on divisibility math, Legendre's formula, factorial factorization, and modular hacks!
        </p>
        <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', height: '0', borderRadius: '12px', overflow: 'hidden' }}>
          <iframe
            style={{ position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', border: '0' }}
            src="https://player.vimeo.com/video/1063320956?title=0&amp;byline=0&amp;portrait=0&amp;badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479"
            title="Phase 2 Class 2"
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
          💡 <strong>Tip:</strong> Keep a notepad ready. Many of these tricks (like Legendre's formula and prefix sum modulos) are frequently used in Div. 2 and Div. 3 contests.
        </div>
      </div> */}

      {/* Divisibility by 2 or 5 */}
      <div id="divisibility-2-5" className="card">
        <h2>1. Divisibility by 2 or 5</h2>
        <p style={{ color: '#cbd5e1' }}>
          For <code>2</code>, the number should be even! Well, that's not something exciting :(. For <code>5</code> the number should end with <code>0</code> or <code>5</code>. We can prove these by looking for patterns (that is by looking closely, which is what we should do as CPers).
        </p>
      </div>

      {/* Divisibility by 3 or 9 */}
      <div id="divisibility-3-9" className="card">
        <h2>2. Divisibility by 3 or 9</h2>
        <p style={{ color: '#cbd5e1' }}>
          The sum of digits should be a multiple of <code>3</code> or a multiple of <code>9</code>. Why does it work? Hmmmm, now it's getting exciting!
        </p>
      </div>

      {/* Divisibility by 4 */}
      <div id="divisibility-4" className="card">
        <h2>3. Divisibility by 4</h2>
        <p style={{ color: '#cbd5e1' }}>
          The basic rule for divisibility by <code>4</code> is that if the number formed by the last two digits in a number is divisible by <code>4</code>, the original number is divisible by <code>4</code>. Why???
        </p>
      </div>

      {/* Divisibility by 6 */}
      <div id="divisibility-6" className="card">
        <h2>4. Divisibility by 6</h2>
        <p style={{ color: '#cbd5e1' }}>
          Think using primes! Hint: <code>6 = 2 * 3</code>. What did you learn from this?
        </p>
      </div>

      {/* Divisibility by 11 */}
      <div id="divisibility-11" className="card">
        <h2>5. Divisibility by 11</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          Add and subtract digits in an alternating pattern (add a digit, subtract next digit, add next digit, etc). Then check if that answer is divisible by <code>11</code>. Why does this even work?
        </p>
        <p style={{ color: '#cbd5e1', fontStyle: 'italic' }}>
          The above examples are given to make you think! That's it.
        </p>
      </div>

      {/* Divisibility and Large Numbers */}
      <div id="large-divisibility" className="card">
        <h2>6. Divisibility and Large Numbers</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          How to check if a number <code>a ≤ 10<sup>100000</sup></code> is divisible by <code>b ≤ 10<sup>9</sup></code>?
        </p>
        <p style={{ color: '#cbd5e1', marginBottom: '16px' }}>
          Since <code>a</code> is too large to fit in any standard datatype, we read it as a string and simulate division character-by-character using basic modular arithmetic properties:
        </p>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => handleCopy(codeSnippets.largeDivisibility, 'largeDivisibility')}
            className="button secondary"
            style={{ position: 'absolute', right: '8px', top: '8px', padding: '6px 12px', fontSize: '12px', zIndex: 10 }}
          >
            {copiedSection === 'largeDivisibility' ? 'Copied! ✅' : 'Copy Code 📋'}
          </button>
          <pre style={{ background: '#0b0f19', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontFamily: 'Courier New, monospace' }}>
            <code style={{ color: '#38bdf8' }}>{codeSnippets.largeDivisibility}</code>
          </pre>
        </div>
      </div>

      {/* Consecutive Divisibility */}
      <div id="consecutive-divisibility" className="card">
        <h2>7. K Consecutive Divisibility</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          <strong>Problem:</strong> You are given an integer <code>n (1 ≤ n ≤ 100)</code>. Find an integer array <code>a<sub>1</sub>, a<sub>2</sub>, ..., a<sub>n</sub></code> of length <code>n</code> such that for each subarray, the product of the elements of that subarray is divisible by the length of the subarray. All <code>a<sub>i</sub></code> should be <code>≤ 10<sup>9</sup></code>.
        </p>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          <strong>Theorem:</strong> The product of every <code>k</code> consecutive number is divisible by <code>k</code>. Why?
        </p>
        <p style={{ color: '#cbd5e1', fontStyle: 'italic' }}>
          Now solve the problem!
        </p>
      </div>

      {/* Divisible by All */}
      <div id="divisible-by-all" className="card">
        <h2>8. Divisible by All</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          How to check if a number <code>x</code> is divisible by both <code>a</code> and <code>b</code>? (Hint: Check if <code>x % lcm(a, b) == 0</code>).
        </p>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          How to check if a number <code>x</code> is divisible by all <code>a</code>, <code>b</code> and <code>c</code>? (Hint: Check if <code>x % lcm(a, lcm(b, c)) == 0</code>).
        </p>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          <strong>Problem:</strong> Find numbers in between <code>[L, R]</code> which are divisible by all Array elements of the given array of size <code>n</code>.
        </p>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          Goal: Solve it in <code>O(R - L + n log n)</code>.
        </p>
        <p style={{ color: '#cbd5e1' }}>
          Tutorial: <a target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }} href="https://www.geeksforgeeks.org/find-numbers-in-between-l-r-which-are-divisible-by-all-array-elements/">GeeksforGeeks smash me link</a>
        </p>
      </div>

      {/* Pair Sums */}
      <div id="pair-sums" className="card">
        <h2>9. Pair Sums and Divisibility</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          <strong>Problem:</strong> Given an array <code>a</code> and positive integer <code>k</code>, the task is to count the total number of pairs in the array whose sum is divisible by <code>k</code>.
        </p>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          Goal: Solve it in <code>O(n)</code> using remainder frequency buckets.
        </p>
        <p style={{ color: '#cbd5e1', marginBottom: '16px' }}>
          Tutorial: <a target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }} href="https://www.geeksforgeeks.org/count-pairs-in-array-whose-sum-is-divisible-by-k/">GeeksforGeeks Link 1</a>
        </p>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          <strong>Problem:</strong> You are given an array of positive and/or negative integers and a value <code>k</code>. The task is to find the count of all sub-arrays whose sum is divisible by <code>k</code>?
        </p>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          Goal: Solve it in <code>O(n)</code> using prefix sums modulo <code>k</code>.
        </p>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          Tutorial: <a target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }} href="https://www.geeksforgeeks.org/count-sub-arrays-sum-divisible-k/">GeeksforGeeks Link 2</a>
        </p>
        <p style={{ color: '#cbd5e1' }}>
          Solve <a target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }} href="https://leetcode.com/problems/subarray-sums-divisible-by-k/">LeetCode Subarray Sums Divisible by K</a>.
        </p>
      </div>

      {/* Hating Divisible Pairs */}
      <div id="hating-divisible-pairs" className="card">
        <h2>10. Hating Divisible Pairs</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          <strong>Problem:</strong> Given an array of integer numbers of size <code>n</code>, we need to find the maximum size of a subset such that the sum of each pair of this subset is not divisible by <code>k</code>.
        </p>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          Goal: Solve it in <code>O(n + k)</code>.
        </p>
        <p style={{ color: '#cbd5e1' }}>
          Tutorial: <a target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }} href="https://www.geeksforgeeks.org/subset-no-pair-sum-divisible-k/">GeeksforGeeks Link</a>
        </p>
      </div>

      {/* Legendre's Formula */}
      <div id="legendres-formula" className="card">
        <h2>11. Legendre's Formula</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          Given an integer <code>n</code> and a prime number <code>p</code>, find the largest <code>x</code> such that <code>p<sup>x</sup></code> divides <code>n!</code> (factorial) in <code>O(log n)</code>.
        </p>
        <p style={{ color: '#cbd5e1', marginBottom: '16px' }}>
          Tutorial: <a target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }} href="https://www.geeksforgeeks.org/legendres-formula-highest-power-of-prime-number-that-divides-n/">GeeksforGeeks Link</a>
        </p>
        <div style={{ position: 'relative', marginBottom: '16px' }}>
          <button
            onClick={() => handleCopy(codeSnippets.legendre, 'legendre')}
            className="button secondary"
            style={{ position: 'absolute', right: '8px', top: '8px', padding: '6px 12px', fontSize: '12px', zIndex: 10 }}
          >
            {copiedSection === 'legendre' ? 'Copied! ✅' : 'Copy Code 📋'}
          </button>
          <pre style={{ background: '#0b0f19', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontFamily: 'Courier New, monospace' }}>
            <code style={{ color: '#38bdf8' }}>{codeSnippets.legendre}</code>
          </pre>
        </div>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          <strong>Bonus:</strong> How to solve it when <code>p</code> is not a prime?
        </p>
        <p style={{ color: '#cbd5e1' }}>
          Tutorial: <a target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }} href="https://www.geeksforgeeks.org/largest-power-k-n-factorial-k-may-not-prime/">GeeksforGeeks Link</a>
        </p>
      </div>

      {/* Trailing Zeroes */}
      <div id="trailing-zeroes" className="card">
        <h2>12. Trailing Zeroes in Factorials</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          Count trailing zeroes in factorial of an integer <code>n</code> in <code>O(log n)</code>.
        </p>
        <p style={{ color: '#cbd5e1' }}>
          Tutorial: <a target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }} href="https://www.geeksforgeeks.org/count-trailing-zeroes-factorial-number/">GeeksforGeeks Link</a>
        </p>
      </div>

      {/* Divisors of a Factorial */}
      <div id="divisors-factorial" className="card">
        <h2>13. Divisors of A Factorial</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          Find the number of divisors of <code>n</code> factorial in <code>O(n log n)</code>.
        </p>
        <p style={{ color: '#cbd5e1' }}>
          Tutorial: <a target="_blank" rel="noopener noreferrer" style={{ color: '#6366f1' }} href="https://www.geeksforgeeks.org/count-divisors-of-factorial/">GeeksforGeeks Link</a>
        </p>
      </div>

      {/* Number of Odd Divisors */}
      <div id="odd-divisors" className="card">
        <h2>14. Number of Odd Divisors</h2>
        <p style={{ color: '#cbd5e1' }}>
          Given an integer <code>n</code>. How to find the number of divisors which are odd? (Hint: Remove all factors of 2 from the prime factorization, then apply the standard divisor counting formula).
        </p>
      </div>

      {/* Goldbach's Conjecture */}
      <div id="goldbach" className="card">
        <h2>15. Goldbach's Conjecture</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          <strong>Conjecture:</strong> Every even integer greater than 2 can be expressed as the sum of two primes. No proof, that's why it's called a conjecture.
        </p>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          <strong>Problem:</strong> For all <em>even</em> integers <code>x</code> from 4 to 10<sup>5</sup>, find any two primes such that their sum is <code>x</code>. Solve it in less than 1s.
        </p>
        <p style={{ color: '#cbd5e1', marginBottom: '16px' }}>
          <strong>Bonus:</strong> For all <em>odd</em> integers <code>x</code> from 4 to 10<sup>5</sup>, find any three primes such that their sum is <code>x</code>. Solve it in less than 1s.
        </p>
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => handleCopy(codeSnippets.goldbach, 'goldbach')}
            className="button secondary"
            style={{ position: 'absolute', right: '8px', top: '8px', padding: '6px 12px', fontSize: '12px', zIndex: 10 }}
          >
            {copiedSection === 'goldbach' ? 'Copied! ✅' : 'Copy Code 📋'}
          </button>
          <pre style={{ background: '#0b0f19', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontFamily: 'Courier New, monospace' }}>
            <code style={{ color: '#38bdf8' }}>{codeSnippets.goldbach}</code>
          </pre>
        </div>
      </div>

      {/* Saving Common Codes */}
      <div id="common-codes" className="card">
        <h2>16. Saving Common Codes for Future Use</h2>
        <p style={{ color: '#cbd5e1' }}>
          As a competitive programmer, you should keep templates of reusable algorithms (Sieve, GCD/LCM, Fast Exponentiation, Segmented Sieve, Legendre's formula) structured nicely in a reference folder to speed up coding during contests.
        </p>
      </div>

      {/* Counting Digits */}
      <div id="digit-counting" className="card">
        <h2>17. Counting Digits of Numbers</h2>
        <p style={{ color: '#cbd5e1' }}>
          To count the digits in <code>N!</code>, we can use Kamenetsky's formula or calculate <code>∑<sub>i=1..N</sub> log10(i)</code>. The count is <code>floor(sum) + 1</code>.
        </p>
      </div>

      {/* Big GCD */}
      <div id="big-gcd" className="card">
        <h2>18. Big GCD</h2>
        <p style={{ color: '#cbd5e1' }}>
          If you need to find the GCD of a huge number <code>A (up to 10<sup>100000</sup>)</code> and a standard integer <code>B (up to 10<sup>9</sup>)</code>, you can perform <code>A % B</code> first using string division (Section 6), and then compute the standard <code>gcd(B, A % B)</code>.
        </p>
      </div>

      {/* GCD and Story of a Fool */}
      <div id="gcd-fool" className="card">
        <h2>19. GCD and a Story of a Fool</h2>
        <p style={{ color: '#cbd5e1', marginBottom: '12px' }}>
          When calculating the LCM of <code>a</code> and <code>b</code> using <code>lcm = (a * b) / gcd(a, b)</code>, many beginners experience overflow when multiplying <code>a * b</code>.
        </p>
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '12px 16px', borderRadius: '4px', borderLeft: '4px solid #ef4444', color: '#fca5a5', fontSize: '14px' }}>
          💡 <strong>Safe Hack:</strong> Always divide first! Use: <code>lcm = (a / gcd(a, b)) * b</code>.
        </div>
      </div>

      {/* Sum of Powers Trick */}
      <div id="power-sum-trick" className="card">
        <h2>20. Sum of Powers Trick</h2>
        <p style={{ color: '#cbd5e1' }}>
          Computing <code>1<sup>k</sup> + 2<sup>k</sup> + ... + N<sup>k</sup></code> can be solved using Lagrange interpolation or Faulhaber's formula in <code>O(k log k)</code> or <code>O(k)</code>.
        </p>
      </div>

      {/* Common Formulas */}
      <div id="common-formulas" className="card">
        <h2>21. Common Formulas</h2>
        <ul style={{ color: '#cbd5e1', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Sum of first <code>n</code> numbers: <code>n * (n + 1) / 2</code></li>
          <li>Sum of squares: <code>n * (n + 1) * (2n + 1) / 6</code></li>
          <li>Sum of cubes: <code>(n * (n + 1) / 2)<sup>2</sup></code></li>
        </ul>
      </div>

      {/* Coding Style */}
      <div id="coding-style" className="card">
        <h2>22. Coding Style</h2>
        <p style={{ color: '#cbd5e1' }}>
          Keep code clean: define constants clearly, make sure variables don't overflow (prefer <code>long long</code> in intermediate multiplications), keep template macros minimal, and use fast input/output streams.
        </p>
      </div>
    </div>
  );
}
