L1: Libzim
L2: ======
L3: 
L4: The Libzim is the reference implementation for the [ZIM file
L5: format](https://wiki.openzim.org/wiki/ZIM_file_format). It's a [software
L6: library](https://en.wikipedia.org/wiki/Library_(computing)) to read
L7: and write ZIM files on many systems and architectures. More
L8: information about the ZIM format and the openZIM project at
L9: https://openzim.org/.
L10: 
L11: [![Release](https://img.shields.io/github/v/tag/openzim/libzim?label=release&sort=semver)](https://download.openzim.org/release/libzim/)
L12: [![Repositories](https://img.shields.io/repology/repositories/libzim?label=repositories)](https://github.com/openzim/libzim/wiki/Repology)
L13: [![macOS Homebrew](https://badgen.net/homebrew/v/libzim)](https://formulae.brew.sh/formula/libzim)
L14: [![License](https://img.shields.io/badge/License-GPL%20v2-blue.svg)](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html)
L15: [![Build](https://github.com/openzim/libzim/workflows/CI/badge.svg?query=branch%3Amain)](https://github.com/openzim/libzim/actions?query=branch%3Amain)
L16: [![OpenSSF Scorecard](https://api.securityscorecards.dev/projects/github.com/openzim/libzim/badge)](https://securityscorecards.dev/viewer/?uri=github.com/openzim/libzim)
L17: [![Doc](https://readthedocs.org/projects/libzim/badge/?style=flat)](https://libzim.readthedocs.io/en/latest/?badge=latest)
L18: [![Codecov](https://codecov.io/gh/openzim/libzim/branch/main/graph/badge.svg)](https://codecov.io/gh/openzim/libzim)
L19: [![CodeFactor](https://www.codefactor.io/repository/github/openzim/libzim/badge)](https://www.codefactor.io/repository/github/openzim/libzim)
L20: 
L21: Disclaimer
L22: ----------
L23: 
L24: This document assumes you have a little knowledge about software
L25: compilation. If you experience difficulties with the dependencies or
L26: with the Libzim compilation itself, we recommend to have a look to
L27: [kiwix-build](https://github.com/kiwix/kiwix-build).
L28: 
L29: Usage
L30: -----
L31: 
L32: Beside the source code, compiled versions of the libzim are made
L33: [available for various
L34: platforms](https://download.openzim.org/release/libzim/).
L35: 
L36: Please notice that on Microsoft Windows with Microsoft compiler, you
L37: need to be careful to not compile in debug mode (because our released
L38: binaries are not).
L39: 
L40: Preamble
L41: --------
L42: 
L43: Although the Libzim can be compiled/cross-compiled on/for many
L44: systems, the following documentation explains how to do it on POSIX
L45: ones. It is primarily though for GNU/Linux systems and has been tested
L46: on recent releases of Ubuntu and Fedora.
L47: 
L48: Dependencies
L49: ------------
L119: ```
L120: 
L121: If Libzim is compiled without Xapian, all search API are removed.  You
L122: can test if an installed version of Libzim is compiled with or without
L123: xapian by testing the define `LIBZIM_WITH_XAPIAN`.
L124: 
L125: Testing
L126: -------
L127: 
L128: ZIM files needed by unit-tests are not included in this repository. By
L129: default, Meson will use an internal directory in your build directory,
L130: but you can specify another directory with option `test_data_dir`:
L131: ```bash
L132: meson . build -Dtest_data_dir=<A_DIR_WITH_TEST_DATA>
L133: ```
L134: 
L135: Whatever you specify a directory or not, you need a extra step to
L136: download the data. At choice:
L137: * Get the data from the repository
L138:   [openzim/zim-testing-suite](https://github.com/openzim/zim-testing-suite)
L232: repository.
L233: 
L234: License
L235: -------
L236: 
L237: [GPLv2](https://www.gnu.org/licenses/old-licenses/gpl-2.0.en.html) or
L238: later, see [COPYING](COPYING) for more details.
